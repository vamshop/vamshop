import React from 'react'
import {Route, IndexRoute} from 'react-router'
import clientSettings from '../client/settings'
import {fetchProduct, fetchProducts, fetchPage, setCategory, receiveSitemap} from './actions'

import api from 'cezerin-client';
api.initAjax(clientSettings.ajaxBaseUrl);

import IndexContainer from './containers/index'
import SharedContainer from './containers/shared'
import CategoryContainer from './containers/category'
import ProductContainer from './containers/product'
import CustomPageContainer from './containers/customPage'
import CheckoutContainer from './containers/checkout'
import CheckoutSuccessContainer from './containers/checkoutSuccess'
import NotFoundContainer from './containers/notfound'

const getSitemap = (path, state, dispatch) => {
  const currentPageFromState = state.app.currentPage;
  // loaded on first request (server side)
  const currentPageAlreadyInState = currentPageFromState && currentPageFromState.path === path;
  if(currentPageAlreadyInState) {
    return Promise.resolve({currentPage: currentPageFromState, currentPageAlreadyInState})
  } else {
    return api.ajax.sitemap.retrieve({ path: path }).then(sitemapResponse => {
      const currentPageFromRequest = sitemapResponse.json;
      if(currentPageFromRequest) {
        dispatch(receiveSitemap(currentPageFromRequest))
      }
      return ({currentPage: currentPageFromRequest, currentPageAlreadyInState});
    })
  }
}

function getComponent(nextState, cb) {
  const {dispatch, getState} = this.store;
  const state = getState();

  getSitemap(nextState.location.pathname, state, dispatch).then(({currentPage, currentPageAlreadyInState}) => {
    if (currentPage) {
      if (currentPage.type === 'product-category') {
        dispatch(setCategory(currentPage.resource))
        if(!currentPageAlreadyInState){
          dispatch(fetchProducts());
        }
        cb(null, props => <CategoryContainer {...props}/>);
      } else if (currentPage.type === 'product') {
        if(!currentPageAlreadyInState){
          dispatch(fetchProduct(currentPage.resource))
        }
        cb(null, props => <ProductContainer {...props}/>);
      } else if (currentPage.type === 'page') {
        if(!currentPageAlreadyInState){
          dispatch(fetchPage(currentPage.resource))
        }
        if(nextState.location.pathname == '/') {
          cb(null, IndexContainer);
        } else if(nextState.location.pathname == '/checkout') {
          cb(null, CheckoutContainer);
        } else if(nextState.location.pathname == '/checkout-success') {
          cb(null, CheckoutSuccessContainer);
        } else {
          cb(null, CustomPageContainer)
        }
      } else {
        cb(null, NotFoundContainer)
      }
    } else {
      cb(null, NotFoundContainer)
    }
  });
}

export default(store) => (
  <Route path='/' component={SharedContainer}>
    <IndexRoute getComponent={getComponent} store={store}/>
    <Route path="/:slug" getComponent={getComponent} store={store}/>
    <Route path="/:categorySlug/:productSlug" getComponent={getComponent} store={store}/>
    <Route path="*" component={NotFoundContainer} status={404}/>
  </Route>
)
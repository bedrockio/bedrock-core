//import { observable, action } from 'mobx';
//import BaseStore from './BaseStore';
import request from 'utils/request';
import { BaseStore, action } from 'utils/store';

export default class Shops extends BaseStore {

  //@observable register = new Map();
  //@observable items = [];
  //@observable totalItems = 0;
  //@observable limit = 20;
  //@observable page = 1;
  //@observable sort = {
    //order: 'desc',
    //field: 'createdAt'
  //};

  //@action
  //setSort({ field, order }) {
    //this.sort = {
      //field,
      //order
    //};
  //}

  //@action
  //setPage(page) {
    //this.page = page;
  //}

  //get(id) {
    //return this.register.get(id);
  //}

  //parseItem(item) {
    //return {
      //...item,
      //updatedAt: new Date(item.updatedAt),
      //createdAt: new Date(item.createdAt)
    //};
  //}

  //@action
  //fetchItem(id, statusKey = `item:${id}`) {
    //const status = this.createStatus(statusKey);
    //return request({
      //method: 'GET',
      //path: `/1/shops/${id}`
    //})
      //.then(({ data }) => {
        //const item = this.parseItem(data);
        //this.register.set(item.id, item);
        //status.success();
        //return item;
      //})
      //.catch((err) => {
        //status.error(err);
        //return err;
      //});
  //}

  @action
  async search() {
    return await request({
      method: 'POST',
      path: '/1/shops/search',
      body: {}
    })
  }

  //@action
  //create(body, statusKey = 'create') {
    //const status = this.createStatus(statusKey);
    //return request({
      //method: 'POST',
      //path: '/1/shops',
      //body
    //})
      //.then(({ data }) => {
        //const item = this.parseItem(data);
        //this.register.set(item.id, item);
        //return this.fetchItems({}, false).then(() => {
          //status.success();
          //return item;
        //});
      //})
      //.catch((err) => {
        //status.error(err);
        //return err;
      //});
  //}

  //@action
  //update(body, statusKey = 'update') {
    //const status = this.createStatus(statusKey);
    //const { id, ...rest } = body;
    //return request({
      //method: 'PATCH',
      //path: `/1/shops/${id}`,
      //body: rest
    //})
      //.then(({ data }) => {
        //const item = this.parseItem(data);
        //this.register.set(item.id, item);
        //return this.fetchItems({}, false).then(() => {
          //status.success();
          //return item;
        //});
      //})
      //.catch((err) => {
        //status.error(err);
        //return err;
      //});
  //}

  //@action
  //delete(item, statusKey = 'delete') {
    //const status = this.createStatus(statusKey);
    //return request({
      //method: 'DELETE',
      //path: `/1/shops/${item.id}`
    //})
      //.then(() => {
        //this.register.delete(item.id);
        //return this.fetchItems({}, false).then(() => {
          //status.success();
          //return item;
        //});
      //})
      //.catch((err) => {
        //status.error(err);
        //return err;
      //});
  //}
}

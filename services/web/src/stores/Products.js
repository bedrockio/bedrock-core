import { observable, action } from 'mobx';
import { request } from 'utils/api';
import BaseStore from 'stores/BaseStore';

export default class ProductsStore extends BaseStore {
  @observable register = new Map();
  @observable items = [];
  @observable totalItems = 0;
  @observable limit = 10;
  @observable page = 1;
  @observable shopId;
  @observable sort = {
    order: 'asc',
    field: 'createdAt'
  };

  parseItem(item) {
    return {
      ...item,
      createdAt: new Date(item.createdAt)
    };
  }

  @action
  setPage(page) {
    this.page = page;
  }

  @action
  setShopId(id) {
    this.items.clear();
    this.register.clear();
    this.shopId = id;
  }

  get(id) {
    return this.register.get(id);
  }

  @action
  fetchItem(id, statusKey = `item:${id}`) {
    const status = this.createStatus(statusKey);
    return request({
      method: 'GET',
      path: `/1/products/${id}`
    })
      .then(({ data }) => {
        const item = this.parseItem(data);
        this.register.set(item.id, item);
        status.success();
        return item;
      })
      .catch((err) => {
        status.error(err);
        return err;
      });
  }

  @action
  fetchItems(
    {
      shop = this.shopId,
      limit = this.limit,
      skip = (this.page - 1) * this.limit
    } = {},
    statusKey = 'list'
  ) {
    this.register.clear();
    const status = this.createStatus(statusKey);
    return request({
      method: 'POST',
      path: '/1/products/search',
      body: {
        limit,
        skip,
        shop,
        sort: this.sort
      }
    })
      .then(({ data, meta }) => {
        const items = data.map((item) => this.parseItem(item));
        items.forEach((item) => {
          this.register.set(item.id, item);
        });
        this.totalItems = meta.total;
        this.items.replace(items);
        status.success();
        return items;
      })
      .catch((err) => {
        status.error(err);
        return err;
      });
  }

  @action
  create(body, statusKey = 'create') {
    const status = this.createStatus(statusKey);
    const { shopId, ...rest } = body;
    return request({
      method: 'POST',
      path: '/1/products',
      body: {
        shop: shopId,
        ...rest,
      }
    })
      .then(({ data }) => {
        const item = this.parseItem(data);
        this.register.set(item.id, item);
        return this.fetchItems({}, false).then(() => {
          status.success();
          return item;
        });
      })
      .catch((err) => {
        status.error(err);
        return err;
      });
  }

  @action
  update(body, statusKey = 'update') {
    const status = this.createStatus(statusKey);
    const { id, shop, ...rest } = body;
    return request({
      method: 'PATCH',
      path: `/1/products/${id}`,
      body: {
        shop: shop.id,
        ...rest
      }
    })
      .then(({ data }) => {
        const item = this.parseItem(data);
        this.register.set(item.id, item);
        return this.fetchItems({}, false).then(() => {
          status.success();
          return item;
        });
      })
      .catch((err) => {
        status.error(err);
        return err;
      });
  }

  @action
  delete(item, statusKey = 'delete') {
    const status = this.createStatus(statusKey);
    return request({
      method: 'DELETE',
      path: `/1/products/${item.id}`
    })
      .then(() => {
        this.register.delete(item.id);
        this.items.remove(item);
        status.success();
        return item;
      })
      .catch((err) => {
        status.error(err);
        return err;
      });
  }
}

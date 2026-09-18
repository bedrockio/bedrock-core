import { loadModel } from '@bedrockio/model';

import category from './definitions/category.json' with { type: 'json' };
import invite from './definitions/invite.json' with { type: 'json' };
import notification from './definitions/notification.json' with { type: 'json' };
import organization from './definitions/organization.json' with { type: 'json' };
import product from './definitions/product.json' with { type: 'json' };
import shop from './definitions/shop.json' with { type: 'json' };
import template from './definitions/template.json' with { type: 'json' };
import upload from './definitions/upload.json' with { type: 'json' };

export { default as User } from './user.js';
export { default as AuditEntry } from './audit-entry.js';

export const Category = loadModel(category, 'Category');
export const Invite = loadModel(invite, 'Invite');
export const Notification = loadModel(notification, 'Notification');
export const Organization = loadModel(organization, 'Organization');
export const Product = loadModel(product, 'Product');
export const Shop = loadModel(shop, 'Shop');
export const Template = loadModel(template, 'Template');
export const Upload = loadModel(upload, 'Upload');

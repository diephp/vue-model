# @diephp/vue-model

Small Vue 3 API model helper around native `fetch`.

The package is intended for ordinary API-backed Vue forms, tables, selectors, and uploads. It keeps the API surface compact:

- Vue 3 reactivity;
- native `fetch`;
- stable `model.data`;
- request helpers;
- validation errors;
- dirty/original snapshot;
- optional auto-send watcher;
- `FormData` upload helper;
- global processing counter.

Runtime dependency: Vue 3 only.

## Installation

```bash
npm install @diephp/vue-model
```

Vue is a peer dependency:

```bash
npm install vue
```

## Build

Build the package into `dist`:

```bash
npm run build
```

Run only JavaScript bundling:

```bash
npm run build:js
```

Run only type declaration generation:

```bash
npm run build:types
```

When the package is packed or published, `prepack` runs the build automatically:

```bash
npm pack
```

## Quick Start

Create a configured API instance once:

```ts
// api.ts
import { createApix } from '@diephp/vue-model'

const apix = createApix()

apix.setBaseUrl('/api')
apix.setHeaders({
  'x-app': 'warehouse-panel',
})

apix.transformResponse((ctx) => {
  const body = ctx.body

  if (!body?.message && Array.isArray(body?.messages)) {
    body.message = body.messages[0]?.message ?? body.messages[0] ?? null
  }

  return body
})

export default apix
```

Use it in a component:

```vue
<script setup lang="ts">
import apix from './api'

interface ProductForm {
  name: string | null
  sku: string | null
  price: number | null
}

const product = apix.create<ProductForm>('/products/42', {
  default: () => ({
    name: null,
    sku: null,
    price: null,
  }),
})
  
</script>

<template>
  <form @submit.prevent="product.post()">
    <input v-model="product.data.name">
    <div v-if="product.error('name')">{{ product.error('name') }}</div>

    <button :disabled="product.processing">
      Save
    </button>
  </form>
</template>
```

`create()` immediately returns a stable reactive model. `model.data` starts from `default` and is replaced/merged after the server response arrives.

## Core Idea

`@diephp/vue-model` treats an API resource as a small reactive model:

```ts
const model = apix.create('/orders/1001', {
  default: () => ({
    status: null,
    customer_id: null,
    items: [],
  }),
})
```

You read and edit:

```ts
model.data.status = 'confirmed'
```

You can reload or change the resource:

```ts
await model.reload()
await model.post('/orders')
await model.put({ omit: ['items'] })
await model.patch({ only: ['status'] })
```

`send()` is the same as `refresh()`. For a JSON model it uses the model method, and the default model method is `GET`. That makes `send()` convenient for search/filter models, but for changing a resource it is usually clearer to call `post`, `put`, or `patch`.

You show errors:

```vue
<el-form-item :error="model.error('status')">
  <el-select v-model="model.data.status" />
</el-form-item>

<ul v-if="model.errors('status').length">
  <li v-for="error in model.errors('status')" :key="error">
    {{ error }}
  </li>
</ul>
```

You check dirty state:

```ts
model.isDirty()
model.isDirty('status')
model.getDirty('status')
model.reset()
```

There is no proxy shortcut like `model.name`. Use `model.data.name`.

## Creating An Instance

```ts
import { createApix } from '@diephp/vue-model'

const apix = createApix()
```

### `apix.setBaseUrl(url)`

Sets the base URL for relative model URLs.

```ts
apix.setBaseUrl('/admin/api')

const profile = apix.create('/profile')
// requests /admin/api/profile
```

If the model URL starts with `?`, it is appended to the base URL:

```ts
apix.setBaseUrl('/admin/products.php')

const products = apix.create('?action=list_products')
// requests /admin/products.php?action=list_products
```

Absolute URLs are used as-is:

```ts
const external = apix.create('https://example.com/api/status')
```

### `apix.setHeaders(headers)`

Replaces global headers:

```ts
apix.setHeaders({
  'x-app': 'inventory',
  authorization: `Bearer ${token}`,
})
```

### `apix.setHeader(name, value)`

Sets one global header:

```ts
apix.setHeader('authorization', `Bearer ${token}`)
```

### `apix.setHeader(headers)`

Merges several global headers:

```ts
apix.setHeader({
  'x-locale': 'en',
  'x-timezone': 'Europe/Madrid',
})
```

### `apix.transformResponse(transformer)`

Adds a global response transformer. It runs for successful and failed HTTP responses.

```ts
apix.transformResponse((ctx) => {
  const body = ctx.body

  if (!body?.message && Array.isArray(body?.messages)) {
    body.message = body.messages[0]?.message ?? body.messages[0] ?? null
  }

  return body
})
```

The transformer receives:

```ts
{
  body,
  ok,
  status,
  statusText,
  headers,
  url,
  method,
  response,
}
```

Transformers can be async:

```ts
apix.transformResponse(async (ctx) => {
  return ctx.body
})
```

## Global Processing

Each `createApix()` instance tracks all active requests:

```ts
apix.activeRequests // number
apix.processing // boolean
```

Example global spinner:

```vue
<template>
  <main v-loading="apix.processing">
    <RouterView />
  </main>
</template>
```

`apix.processing` is `true` while at least one model created by that `apix` instance is making a request.

## Factory Methods

### `apix.create<T>(url, options?)`

Creates a JSON model.

```ts
const invoice = apix.create('/invoices/77', {
  default: () => ({
    number: null,
    amount: null,
    status: null,
  }),
})
```

### `apix.createModel<T>(url, options?)`

Alias to `apix.create()`.

```ts
const invoice = apix.createModel('/invoices/77')
```

### `apix.createCollection<TItem>(url, options?)`

Sugar for list/selector data.

```ts
const cityOptions = apix.createCollection<{ id: number; name: string }>(
  '?action=get_cities',
)
```

Internally this is equivalent to:

```ts
apix.create(url, {
  default: () => [],
  snapshot: false,
  ...options,
})
```

Use it when you need data and processing, but do not need dirty/reset/original tracking.

### `apix.createForm(url, options?)`

Creates a `FormData` model for uploads.

```ts
const uploadForm = apix.createForm('/documents/upload')

uploadForm.data.append('meta', JSON.stringify({ folder_id: 10 }))
uploadForm.data.append('file', file)

await uploadForm.send()
```

`createForm()` does not mix JSON and `FormData`. If you need JSON metadata with a file, put the metadata into the form:

```ts
uploadForm.data.append('meta', JSON.stringify({
  title: 'Monthly report',
  category: 'finance',
}))

uploadForm.data.append('file', file)
```

For `FormData`, the package does not set `content-type`. The browser sets `multipart/form-data` with the correct boundary.

The JSON response from an upload is not merged into `form.data`, because `form.data` must remain `FormData`. Use `onSuccess` when you need the upload response body.

```ts
const uploadForm = apix.createForm('/documents/upload', {
  onSuccess: (body) => {
    console.log(body)
  },
})

await uploadForm.send()
```

## Model State

Every model exposes:

```ts
model.data
model.processing
model.httpCode
model.message
```

### `model.data`

Reactive model data.

```ts
model.data.name = 'Express scanner'
```

For JSON models, `data` starts from `default`.

For `createForm`, `data` is a `FormData` object.

### `model.processing`

`true` while this model has an active request.

```vue
<el-button :loading="product.processing">
  Save
</el-button>
```

### `model.httpCode`

Last HTTP status code.

```ts
model.httpCode // 200, 422, 500, null
```

### `model.message`

Last error message, if any.

```vue
<el-alert v-if="model.message" :title="model.message" />
```

Successful requests clear `message`.

## Model Options

```ts
apix.create('/products/42', {
  params: { locale: 'en' },
  path: 'item',
  headers: { 'x-screen': 'product-edit' },
  immediate: true,
  method: 'POST',
  default: () => ({ name: null }),
  only: ['name'],
  omit: ['local_state'],
  response: { omit: ['name'] },
  watch: { only: ['pagination.page'], debounce: 300 },
  timeout: 5000,
  abort: true,
  locked: false,
  snapshot: true,
  clearErrorOnChange: true,
  before: (payload) => payload,
  after: (body) => body,
  onSuccess: (body, model) => {},
  onError: (error, model) => {},
  onFinish: (model, error) => {},
  onProcessing: (active, model) => {},
})
```

### `default`

Object or callback used as initial data.

```ts
default: () => ({
  name: null,
  status: 'draft',
  items: [],
})
```

If not provided, `data` starts as `null`.

`default` is used:

- when the model is created;
- when `model.default()` is called;
- as the base for `reload()` merge.

### `immediate`

Controls whether the model sends the first request immediately.

```ts
immediate: true // default for JSON models
immediate: false
```

Use `immediate: false` for create forms or when you want to wait for a user action.

```ts
const search = apix.create('/parcels/search', {
  immediate: false,
  default: () => ({
    tracking_number: null,
    parcel: null,
  }),
})

await search.send()
```

`createForm()` defaults to `immediate: false`.

### `params`

Extra request params. Can be an object or callback.

```ts
params: {
  warehouse_id: 15,
}
```

For `GET` and `HEAD`, params are added to the query string.

For body methods, params are merged into the payload.

Callbacks run right before the request:

```ts
params: () => ({
  route_id: route.query.id,
  locale: i18n.locale.value,
})
```

### `headers`

Request headers for this model/request.

```ts
headers: {
  'x-module': 'scanner-editor',
}
```

Can be a callback:

```ts
headers: () => ({
  authorization: `Bearer ${auth.token}`,
})
```

Request headers override global headers with the same name.

### `method`

Default method for requests made by `request`, `send`, `refresh`, and `reload`.

For JSON models, the default is `GET`.

For `createForm()`, the default is `POST`.

```ts
method: 'PATCH'
```

Explicit method helpers override the default:

```ts
await model.post() // POST
await model.put() // PUT
await model.patch() // PATCH
```

Request options can override even a helper method:

```ts
await model.post({ method: 'GET' })
```

The request option has priority.

### `path`

Path inside the response body where model data lives.

```ts
const product = apix.create('/products/42', {
  path: 'item',
})
```

If the response is:

```json
{
  "item": {
    "id": 42,
    "name": "Label printer"
  }
}
```

then `model.data` receives:

```ts
{
  id: 42,
  name: 'Label printer',
}
```

`path` is not the request URL. The request URL is the first argument passed to `create`, `request`, `get`, `post`, etc.

### `only`

Filters the payload sent to the server.

```ts
only: ['name', 'pagination.page', 'pagination.onPage']
```

If you send:

```ts
await model.send()
```

only those fields are included in the request body.

If you specify an object path:

```ts
only: ['pagination']
```

the whole `pagination` object is sent.

`only` does not filter the response.

### `omit`

Excludes fields from the payload sent to the server.

```ts
omit: ['items', 'local_state']
```

Fields in `omit` are also excluded from the original snapshot. That means:

- `isDirty('items')` is always `false`;
- `getOriginal('items')` is `undefined`;
- `reset()` does not change `items`.

Use `snapshot: false` when you want to disable snapshot tracking completely.

### `response.only` and `response.omit`

Filters successful response data before it is applied to `model.data`.

Default: successful response data is applied completely.

Example: send filters, but do not let the response overwrite a text input:

```ts
await model.send({
  only: ['name', 'pagination'],
  response: {
    omit: ['name'],
  },
})
```

Example: only apply table data from the response:

```ts
await model.send({
  response: {
    only: ['items', 'pagination'],
  },
})
```

Error responses do not apply to `model.data`.

### `watch`

Automatically sends the model when watched fields change.

```ts
watch: true
```

```ts
watch: {
  debounce: 300,
}
```

By default, `watch` uses the model payload filter:

```ts
only: ['name', 'pagination.page'],
watch: true
```

This watches `name` and `pagination.page`.

Override watched fields:

```ts
only: ['name', 'pagination.page', 'pagination.onPage'],
watch: {
  only: ['pagination.page', 'pagination.onPage'],
}
```

Now `name` is still sent when the request runs, but changing `name` does not start the request.

Use `watch.omit`:

```ts
watch: {
  omit: ['name', 'items'],
}
```

`watch.only: []` means watch nothing.

When the package applies a response, `reset`, or `default`, the watcher is muted to avoid request loops.

### `timeout`

Aborts a request after the given number of milliseconds.

```ts
timeout: 5000
```

Timeout errors reject with `ApixError`:

```ts
try {
  await model.send()
} catch (error) {
  if (error.timeout) {
    console.log('Request timed out')
  }
}
```

### `abort`

Default: `true`.

```ts
abort: true
```

When a new request starts, the previous active request for this model is aborted.

### `locked`

Default: `false`.

```ts
locked: true
```

If a request is already active, a new request does not start. The current promise is returned instead.

Priority:

- `locked: true` blocks new requests while processing;
- `locked: false, abort: true` aborts the previous request;
- `locked: false, abort: false` allows concurrent requests, but only the latest response applies to the model.

### `snapshot`

Default for JSON models: `true`.

Default for `createCollection` and `createForm`: `false`.

```ts
snapshot: false
```

Disables original copy storage and dirty/reset tracking.

Useful for selector options:

```ts
const countryOptions = apix.createCollection('/countries/options')
```

or:

```ts
const countryOptions = apix.create('/countries/options', {
  default: () => [],
  snapshot: false,
})
```

### `clearErrorOnChange`

Default: `true`.

When a field changes, the matching field error is cleared.

```ts
clearErrorOnChange: true
```

Example:

```ts
model.error('email') // "Email is required"

model.data.email = 'user@example.com'

model.error('email') // null
```

This works independently of `watch`.

### `before`

Transforms payload before sending it. It does not mutate `model.data` unless you do so manually.

```ts
before: (payload) => {
  return {
    ...payload,
    normalized_name: payload.name?.trim(),
  }
}
```

With context:

```ts
before: (payload, ctx) => {
  console.log(ctx.url, ctx.method)
  return payload
}
```

### `after`

Transforms successful response data before it is applied to `model.data`.

```ts
after: (body) => {
  return {
    ...body,
    loaded_at: Date.now(),
  }
}
```

`after` runs after `path` is applied and before `response.only/omit`.

### `onSuccess`

Called after a successful response.

```ts
onSuccess: (body, model) => {
  console.log('Saved', body)
}
```

### `onError`

Called after a failed response.

```ts
onError: (error, model) => {
  console.log(error.message)
  console.log(error.error('name'))
}
```

### `onFinish`

Called after success or failure.

```ts
onFinish: (model, error) => {
  console.log(error ? 'failed' : 'finished')
}
```

### `onProcessing`

Called when model processing starts and stops.

```ts
onProcessing: (active) => {
  progressBar.toggle(active)
}
```

## Request Methods

All request methods return `Promise<TData>`.

```ts
await model.request()
await model.get()
await model.post()
await model.put()
await model.patch()
await model.delete()
await model.reload()
await model.refresh()
await model.send()
```

### `send()` and `refresh()`

`send()` is exactly the same method as `refresh()`.

```ts
model.send === model.refresh // true
```

Both methods:

- send current `model.data`;
- use the model method;
- use `GET` by default for JSON models;
- apply `only` / `omit` to the request payload;
- merge a successful response into current `model.data`;
- update the original snapshot after success.

Use whichever name reads better:

```ts
await filterModel.refresh()
await searchModel.send()
```

For changing a resource, prefer explicit methods:

```ts
await productForm.post()
await productForm.put()
await productForm.patch({ only: ['status'] })
```

### Argument Forms

Request methods accept either a URL, options, or both:

```ts
await model.post()
await model.post('/products')
await model.post({ only: ['name'] })
await model.post('/products', { only: ['name'] })
```

You can also pass the URL inside options:

```ts
await model.post({
  url: '/products',
  only: ['name'],
})
```

Options passed to a request override model options for that one request:

```ts
const product = apix.create('/products/42', {
  only: ['name', 'price'],
})

await product.patch({
  only: ['status'],
})
```

In this request only `status` is sent.

### Method Override

The method helpers are convenient defaults. `options.method` has the highest priority:

```ts
await model.post({
  method: 'GET',
  only: ['name'],
})
```

This sends a `GET` request, not `POST`.

This is mostly useful when a model has a configured method and you want to override it once:

```ts
const report = apix.create('/reports/export', {
  method: 'POST',
})

await report.send() // POST
await report.send({ method: 'GET' }) // GET
```

### Payload Rules

`get`, `post`, `put`, `patch`, `delete`, `request`, `send`, and `refresh` are send-style methods. They use current `model.data` as payload.

For `GET` and `HEAD`, the payload becomes query params:

```ts
model.data.name = 'phone'
model.data.pagination.page = 2

await model.get({
  only: ['name', 'pagination.page'],
})

// GET /...?name=phone&pagination.page=2
```

For body methods, the payload is JSON:

```ts
await model.patch({
  only: ['name', 'price'],
})
```

The body will be:

```json
{
  "name": "Desk",
  "price": 120
}
```

`body` overrides automatic payload building:

```ts
await model.patch({
  body: model.getDirty(),
})
```

When `body` is passed, `only`, `omit`, and `before` are not used to build the payload.

### `reload()` Is Different

`reload()` means "load model data again". It does not send current `model.data`.

```ts
await model.reload()
```

If you need params for `reload`, use `params`:

```ts
await model.reload({
  params: {
    page: 2,
    onPage: 50,
  },
})
```

For `reload()`, the successful response is merged with fresh `default()` data:

```ts
data = merge(default(), responseData)
```

For `send()` / `refresh()` / `post()` / `patch()` / etc., the successful response is merged with current data:

```ts
data = merge(currentData, responseData)
```

### `model.request(url?, options?)`

Generic request method.

```ts
await model.request('/products/search', {
  method: 'POST',
  only: ['name'],
})
```

### `model.get(url?, options?)`

Sends a `GET` request.

```ts
await model.get('/products/42')
```

For `GET`, payload and params are converted to query params.

Examples:

```ts
await model.get({
  only: ['name', 'pagination.page'],
})
```

```ts
await model.get('/products/search', {
  params: {
    warehouse_id: 10,
  },
  only: ['name'],
})
```

If `model.data.name` is `"phone"`, this builds a query similar to:

```text
/products/search?name=phone&warehouse_id=10
```

### `model.post(url?, options?)`

Sends a `POST` request.

```ts
await model.post('/products')
```

Examples:

```ts
await model.post({
  only: ['name', 'sku', 'price'],
})
```

```ts
await model.post('/products/create', {
  omit: ['items', 'local_state'],
})
```

```ts
await model.post({
  url: '/products/create',
  response: {
    omit: ['name'],
  },
})
```

### `model.put(url?, options?)`

Sends a `PUT` request.

```ts
await model.put('/products/42')
```

Examples:

```ts
await model.put({
  only: ['name', 'status', 'settings'],
})
```

```ts
await model.put('/products/42', {
  omit: ['items', 'logs'],
})
```

### `model.patch(url?, options?)`

Sends a `PATCH` request.

```ts
await model.patch('/products/42', {
  only: ['name', 'price'],
})
```

Patch with only dirty data:

```ts
await model.patch({
  body: model.getDirty(),
})
```

Patch one nested value:

```ts
await model.patch({
  only: ['settings.resource.limit'],
})
```

### `model.delete(url?, options?)`

Sends a `DELETE` request.

```ts
await model.delete('/products/42')
```

Examples:

```ts
await model.delete()
```

```ts
await model.delete('/products/42', {
  params: {
    force: true,
  },
})
```

```ts
await model.delete({
  url: '/products/42',
  only: ['reason'],
})
```

### `model.reload(options?)`

Loads data from the server.

Default method: `GET`.

Merge rule:

```ts
model.data = merge(default(), responseData)
```

Example:

```ts
await product.reload()
```

Useful when you want the server to become the source of truth again.

Examples:

```ts
await product.reload({
  params: {
    include: 'items,logs',
  },
})
```

```ts
await product.reload({
  response: {
    only: ['name', 'status', 'items'],
  },
})
```

`reload()` does not send current `model.data`. Use `params` for extra request data.

### `model.refresh(options?)`

Sends current model data to the server.

Default method for JSON models: `GET`.

Merge rule:

```ts
model.data = merge(currentData, responseData)
```

Example:

```ts
await searchModel.refresh()
```

Examples:

```ts
await searchModel.refresh({
  only: ['name', 'price'],
})
```

This sends `name` and `price` as query params unless the model or request sets another method.

```ts
await productForm.refresh({
  method: 'PATCH',
  omit: ['items', 'logs'],
  response: {
    omit: ['name'],
  },
})
```

### `model.send(options?)`

Alias to `refresh()`.

```ts
await searchModel.send()
```

This often reads better for search/filter models.

Examples:

```ts
await search.send({
  only: ['name', 'price'],
})
```

```ts
await productForm.send({
  method: 'PATCH',
  body: productForm.getDirty(),
})
```

## Data Methods

### `model.setData(data)`

Replaces `model.data`.

```ts
model.setData({
  name: 'New scanner',
  status: 'active',
})
```

Use this when you want to replace the whole model manually:

```ts
model.setData({
  name: null,
  items: [],
  pagination: {
    page: 1,
    onPage: 50,
    total: 0,
  },
})
```

### `model.push(data)`

For objects, deep-merges data into `model.data`.

```ts
model.push({
  status: 'active',
})
```

Nested object example:

```ts
model.push({
  pagination: {
    page: 1,
  },
})
```

Only `pagination.page` changes. Other `pagination` fields stay as they are.

For arrays, pushes one item.

```ts
const options = apix.createCollection('/tag-options')

options.push({
  id: 10,
  label: 'Fragile',
})
```

### `model.reset(options?)`

Resets data to the latest successful original snapshot.

```ts
model.reset()
```

Reset one field:

```ts
model.reset({
  only: ['name'],
})
```

Reset nested fields:

```ts
model.reset({
  only: ['settings.resource.limit', 'pagination.page'],
})
```

Reset everything except one field:

```ts
model.reset({
  omit: ['pagination.page'],
})
```

This is useful when a table should reset filters but keep the current page.

Fields excluded by the model-level `omit` are not stored in the snapshot and are not changed by `reset()`.

### `model.default(options?)`

Resets data to `default`.

```ts
model.default()
```

Reset selected fields to default:

```ts
model.default({
  only: ['status', 'type'],
})
```

Reset one nested field to default:

```ts
model.default({
  only: ['pagination.page'],
})
```

Reset defaults but keep local UI data:

```ts
model.default({
  omit: ['items', 'local_state'],
})
```

## Dirty And Original Snapshot

Successful requests update the original snapshot:

```ts
await model.send()
model.isDirty() // false
```

Failed requests do not update the snapshot:

```ts
try {
  await model.send()
} catch {}

model.isDirty() // still true if data changed
```

### `model.isDirty(key?)`

Checks whether data differs from the latest snapshot.

```ts
model.isDirty()
model.isDirty('name')
model.isDirty('settings.resource.limit')
```

Example:

```ts
if (model.isDirty()) {
  await model.send()
}
```

Field example:

```ts
if (model.isDirty('pagination.page')) {
  await model.get({
    only: ['pagination.page'],
  })
}
```

### `model.getOriginal(key?)`

Returns the latest snapshot.

```ts
model.getOriginal()
model.getOriginal('name')
```

Example:

```ts
const was = model.getOriginal('status')
const now = model.data.status
```

No default values are silently mixed into `getOriginal`.

If `snapshot: false`, this returns `null` without a key and `undefined` with a key.

### `model.getDirty(key?)`

Returns changed current values.

```ts
model.getDirty()
model.getDirty('name')
```

Example return value:

```ts
model.data = {
  name: 'Scanner B',
  status: 'active',
  pagination: {
    page: 2,
    onPage: 50,
  },
}

model.getDirty()
```

Possible result:

```json
{
  "name": "Scanner B",
  "pagination": {
    "page": 2
  }
}
```

If the field is not dirty:

```ts
model.getDirty('name') // undefined
```

## Errors

Error responses are not merged into `model.data`.

If the server returns:

```json
{
  "message": "Validation failed",
  "errors": {
    "name": [
      "Name is required"
    ],
    "settings.resource.limit": [
      "Limit is too high"
    ]
  }
}
```

then:

```ts
model.message // "Validation failed"
model.error('name') // "Name is required"
model.errors('name') // ["Name is required"]
model.errorKeys() // ["name", "settings.resource.limit"]
```

### `model.error(key)`

Returns the first error string for a field or `null`.

```vue
<el-form-item :error="product.error('name')">
```

Nested key:

```vue
<el-form-item :error="product.error('settings.resource.limit')">
```

### `model.errors(key)`

Returns all error strings for a field.

```ts
model.errors('name')
```

Show all field messages:

```vue
<ul v-if="model.errors('name').length">
  <li v-for="message in model.errors('name')" :key="message">
    {{ message }}
  </li>
</ul>
```

If the key does not exist, returns an empty array.

### `model.errors()`

Returns the raw errors object.

```ts
model.errors()
```

### `model.errorKeys()`

Returns error paths.

```ts
model.errorKeys()
```

Useful for forms split into tabs.

```ts
const keys = model.errorKeys()

if (keys[0]?.startsWith('settings.')) {
  activeTab.value = 'settings'
}
```

### `model.hasErrors(keyOrKeys)`

Checks whether one field or any field from a list has an error.

```ts
model.hasErrors('name')
model.hasErrors(['name', 'settings.resource.limit'])
```

Example tab switch:

```ts
if (model.hasErrors(['name', 'slug'])) {
  activeTab.value = 'general'
}

if (model.hasErrors(['settings.resource.limit', 'settings.weight.limit'])) {
  activeTab.value = 'limits'
}
```

This returns `true` if at least one key from the list has an error.

### `model.firstErrorKey()`

Returns the first error path or `null`.

```ts
const firstKey = model.firstErrorKey()
```

### `model.getError()`

Returns the latest `ApixError` or `null`.

```ts
const error = model.getError()

if (error?.has(['name', 'slug'])) {
  activeTab.value = 'general'
}
```

Useful when you want to inspect the raw response:

```ts
const error = model.getError()

console.log(error?.httpCode)
console.log(error?.body)
console.log(error?.keys())
```

### `model.clearError(key)`

Clears one field error.

```ts
model.clearError('name')
```

Nested key:

```ts
model.clearError('settings.resource.limit')
```

### `model.clearErrors()`

Clears all errors and message.

```ts
model.clearErrors()
```

Useful before closing a modal or changing a large part of a form manually.

### `clearErrorOnChange`

By default, editing a field clears that field error:

```ts
model.data.name = 'New name'
model.error('name') // null
```

This works even when `watch` is disabled.

## ApixError

Requests reject with `ApixError`.

```ts
import { ApixError } from '@diephp/vue-model'

try {
  await model.send()
} catch (error) {
  if (error instanceof ApixError) {
    console.log(error.httpCode)
    console.log(error.message)
  }
}
```

Properties:

```ts
error.httpCode
error.body
error.message
error.aborted
error.timeout
error.cause
```

Methods:

```ts
error.error('name')
error.errors('name')
error.errors()
error.keys()
error.has('name')
error.has(['name', 'slug'])
error.firstKey()
```

## Keys And Filters

Many methods and options accept keys:

```ts
'name'
'pagination'
'pagination.page'
'settings.resource.limit'
```

The same key format works in:

- `only`;
- `omit`;
- `response.only`;
- `response.omit`;
- `watch.only`;
- `watch.omit`;
- `error(key)`;
- `errors(key)`;
- `hasErrors(keyOrKeys)`;
- `isDirty(key)`;
- `getDirty(key)`;
- `getOriginal(key)`;
- `reset({ only, omit })`;
- `default({ only, omit })`.

### Plain Key

```ts
only: ['name']
```

Given:

```ts
model.data = {
  name: 'Scanner A',
  status: 'active',
}
```

the request payload is:

```json
{
  "name": "Scanner A"
}
```

### Whole Object Key

```ts
only: ['pagination']
```

Given:

```ts
model.data = {
  name: 'Scanner A',
  pagination: {
    page: 2,
    onPage: 50,
    total: 300
  }
}
```

the request payload is:

```json
{
  "pagination": {
    "page": 2,
    "onPage": 50,
    "total": 300
  }
}
```

Use this when the server expects the whole object.

### Nested Key

```ts
only: ['pagination.page']
```

Given the same data, the request payload is:

```json
{
  "pagination": {
    "page": 2
  }
}
```

Use this when the server only needs one nested value.

### Multiple Keys

```ts
await model.send({
  only: [
    'name',
    'category_id',
    'pagination.page',
    'pagination.onPage',
  ],
})
```

Payload:

```json
{
  "name": "Scanner A",
  "category_id": 7,
  "pagination": {
    "page": 2,
    "onPage": 50
  }
}
```

### Excluding Keys With `omit`

```ts
await model.send({
  omit: ['items', 'debug', 'local_state'],
})
```

Everything except these keys is sent.

Nested omit:

```ts
await model.send({
  omit: ['pagination.total'],
})
```

This keeps `pagination.page` and `pagination.onPage`, but removes `pagination.total`.

### Combining `only` And `omit`

`only` is applied first, then `omit`.

```ts
await model.send({
  only: ['name', 'pagination'],
  omit: ['pagination.total'],
})
```

Payload:

```json
{
  "name": "Scanner A",
  "pagination": {
    "page": 2,
    "onPage": 50
  }
}
```

### Empty Lists

Empty arrays are meaningful:

```ts
only: []
```

means "send nothing from `model.data`".

```ts
omit: []
```

means "exclude nothing".

```ts
watch: {
  only: [],
}
```

means "watch nothing".

To avoid storing a snapshot, use:

```ts
snapshot: false
```

Do not use `omit: []` for that. Empty `omit` means no keys are omitted.

### Response Keys

`only` and `omit` filter request payload.

`response.only` and `response.omit` filter successful response data.

```ts
await model.send({
  only: ['name', 'pagination'],
  response: {
    omit: ['name'],
  },
})
```

This sends `name` and `pagination`, but the response is not allowed to overwrite `name`.

```ts
await model.send({
  response: {
    only: ['items', 'pagination.total'],
  },
})
```

This applies only `items` and `pagination.total` from the successful response.

### Watch Keys

If `watch.only` and `watch.omit` are not passed, watch uses the model request filter.

```ts
const table = apix.create('/stock/table', {
  only: ['name', 'pagination.page', 'pagination.onPage'],
  watch: true,
})
```

Changing `name`, `pagination.page`, or `pagination.onPage` starts a request.

Override watched keys:

```ts
const table = apix.create('/stock/table', {
  only: ['name', 'pagination.page', 'pagination.onPage'],
  watch: {
    only: ['pagination.page', 'pagination.onPage'],
  },
})
```

Now `name` is still sent in the request, but editing `name` does not start a request.

Use `watch.omit` when it is easier to exclude a few fields:

```ts
watch: {
  omit: ['name', 'items'],
}
```

### Error Keys

Laravel-style errors often use dot paths:

```json
{
  "message": "Validation failed",
  "errors": {
    "settings.resource.limit": [
      "Limit is too high"
    ],
    "items.0.name": [
      "Item name is required"
    ]
  }
}
```

Read them directly:

```ts
model.error('settings.resource.limit')
model.errors('items.0.name')
model.hasErrors(['name', 'settings.resource.limit'])
```

For tabbed forms:

```ts
if (model.hasErrors(['name', 'sku'])) {
  activeTab.value = 'general'
}

if (model.hasErrors(['settings.resource.limit', 'settings.weight.limit'])) {
  activeTab.value = 'limits'
}

if (model.hasErrors(['items'])) {
  activeTab.value = 'items'
}
```

### Dirty Keys

```ts
model.isDirty('name')
model.isDirty('pagination.page')

model.getDirty('name')
model.getOriginal('name')
```

Reset selected values:

```ts
model.reset({
  only: ['name', 'pagination.page'],
})
```

Reset everything except current page:

```ts
model.reset({
  omit: ['pagination.page'],
})
```

### Keys That Contain Dots

Keys with dots are supported. Exact keys have priority at each level.

For:

```ts
const data = {
  settings: {
    'resource.limit': 10,
  },
}
```

this key works:

```ts
model.isDirty('settings.resource.limit')
```

The helper first tries:

```ts
data['settings.resource.limit']
```

then:

```ts
data.settings['resource.limit']
```

then:

```ts
data.settings.resource.limit
```

If the server returns both exact-dot keys and nested structures for the same path, the data is ambiguous. The package will still choose a value predictably, but the API response should be fixed.

### Arrays In Keys

For error lookup, array-like Laravel keys are fine:

```ts
model.error('items.0.name')
```

For request payload filters, prefer selecting the whole array:

```ts
only: ['items']
```

instead of selecting one array item:

```ts
only: ['items.0.name']
```

The package is optimized for JSON form objects. Sending whole arrays is usually clearer and safer.

## Lifecycle And `stop()`

If a model is created inside a Vue `setup()` scope, it is automatically stopped when the component is unmounted.

```vue
<script setup lang="ts">
const model = apix.create('/profile')
</script>
```

On unmount:

- watcher is stopped;
- debounce timer is cleared;
- active request is aborted;
- delayed `immediate` request will not start.

If you create a model outside a component scope, stop it manually when you no longer need it:

```ts
const model = apix.create('/reports/live', {
  watch: true,
})

model.stop()
```

Calling request methods after `stop()` rejects with an `ApixError` where `aborted` is `true`.

## Examples

### Edit Resource Form

```vue
<script setup lang="ts">
import apix from './api'

interface DeviceForm {
  name: string | null
  serial_number: string | null
  status: 'active' | 'disabled' | null
}

const deviceForm = apix.create<DeviceForm>('/devices/120', {
  path: 'item',
  default: () => ({
    name: null,
    serial_number: null,
    status: null,
  }),
})

const save = async () => {
  await deviceForm.send({
    only: ['name', 'serial_number', 'status'],
  })
}
</script>

<template>
  <el-form v-loading="deviceForm.processing">
    <el-form-item label="Name" :error="deviceForm.error('name')">
      <el-input v-model="deviceForm.data.name" />
    </el-form-item>

    <el-form-item label="Serial number" :error="deviceForm.error('serial_number')">
      <el-input v-model="deviceForm.data.serial_number" />
    </el-form-item>

    <el-form-item label="Status" :error="deviceForm.error('status')">
      <el-select v-model="deviceForm.data.status">
        <el-option label="Active" value="active" />
        <el-option label="Disabled" value="disabled" />
      </el-select>
    </el-form-item>

    <el-button type="primary" :loading="deviceForm.processing" @click="save">
      Save
    </el-button>
  </el-form>
</template>
```

### Create Form Without Immediate Request

```ts
const createWarehouse = apix.create('/warehouses', {
  immediate: false,
  default: () => ({
    name: '',
    country_id: null,
    city_id: null,
  }),
})

await createWarehouse.post()
```

### Search Form

```vue
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import apix from './api'

const route = useRoute()
const router = useRouter()
const initialQuery = String(route.query.query ?? '')

const searchForm = apix.create('/catalog/search', {
  immediate: Boolean(initialQuery),
  default: () => ({
    query: initialQuery,
    product: null,
    history: null,
  }),
  only: ['query'],
  omit: ['product', 'history'],
  params: () => ({
    query: searchForm.data.query || undefined,
  }),
  onError: () => {
    searchForm.push({
      product: null,
      history: null,
    })
  },
  onFinish: () => {
    router.replace({
      query: {
        ...route.query,
        query: searchForm.data.query || undefined,
      },
    })
  },
})
</script>

<template>
  <el-form-item :error="searchForm.error('query')">
    <el-input
      v-model="searchForm.data.query"
      placeholder="Search product"
      clearable
    />
  </el-form-item>

  <el-button
    type="primary"
    :disabled="!searchForm.data.query"
    :loading="searchForm.processing"
    @click="searchForm.send()"
  >
    Search
  </el-button>
</template>
```

### Table With Filters And Pagination

Changing page sends the request automatically. Changing name does not send until the user clicks search.

```ts
const tableModel = apix.create('/inventory/table', {
  default: () => ({
    name: null,
    category_id: null,
    items: [],
    pagination: {
      page: 1,
      onPage: 50,
      total: 0,
    },
  }),
  only: ['name', 'category_id', 'pagination.page', 'pagination.onPage'],
  watch: {
    only: ['pagination.page', 'pagination.onPage'],
    debounce: 250,
  },
})

const search = () => {
  tableModel.send()
}
```

Payload includes `name`, `category_id`, `pagination.page`, and `pagination.onPage`.

Only `pagination.page` and `pagination.onPage` trigger automatic requests.

### Filters That Auto-Refresh

```ts
const ruleModel = apix.create('/shipping/rules', {
  default: () => ({
    name: null,
    carrier_ids: [],
    country_ids: [],
    service_ids: [],
    items: [],
    pagination: {
      page: 1,
      onPage: 50,
      total: 0,
    },
  }),
  only: [
    'name',
    'carrier_ids',
    'country_ids',
    'service_ids',
    'pagination.page',
    'pagination.onPage',
  ],
  watch: {
    debounce: 300,
  },
})
```

Because `watch.only` is not provided, watcher uses the model `only` list.

### Avoid Input Jump From Server Response

If a server returns filter fields back, you may not want to overwrite the current user input.

```ts
await tableModel.send({
  only: ['name', 'pagination'],
  response: {
    omit: ['name'],
  },
})
```

The request sends `name` and `pagination`. The response applies everything except `name`.

### Apply Only Table Data From Response

```ts
await tableModel.send({
  response: {
    only: ['items', 'pagination'],
  },
})
```

Useful when the response contains metadata you do not want to store in the model.

### Selector Options

```vue
<script setup lang="ts">
import apix from './api'

const hubOptions = apix.createCollection<{ id: number; name: string }>(
  '/hubs/options',
)
</script>

<template>
  <el-select
    v-model="scannerForm.data.hub_id"
    v-loading="hubOptions.processing"
    placeholder="Select hub"
  >
    <el-option
      v-for="hub in hubOptions.data"
      :key="hub.id"
      :label="hub.name"
      :value="hub.id"
    />
  </el-select>
</template>
```

`createCollection` uses `snapshot: false`, so it does not store a second copy of the options.

### Several Selectors On One Page

```ts
const hubOptions = apix.createCollection('/hubs/options')
const roleOptions = apix.createCollection('/roles/options')
const countryOptions = apix.createCollection('/countries/options')
const timezoneOptions = apix.createCollection('/timezones/options')
```

Use the global spinner if you want to wait for all of them:

```vue
<section v-loading="apix.processing">
```

Or use each model's own spinner:

```vue
<el-select v-loading="countryOptions.processing" />
```

### File Upload

```vue
<script setup lang="ts">
import apix from './api'

const upload = apix.createForm('/files/upload', {
  onSuccess: (body) => {
    console.log('Uploaded file', body)
  },
})

const uploadFile = async (file: File) => {
  upload.data.set('meta', JSON.stringify({
    folder: 'contracts',
    visibility: 'private',
  }))

  upload.data.set('file', file)

  await upload.send()
}
</script>
```

### Laravel Validation Errors

Laravel usually returns:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "The email field is required."
    ]
  }
}
```

Use directly:

```vue
<el-form-item label="Email" :error="userForm.error('email')">
  <el-input v-model="userForm.data.email" />
</el-form-item>
```

### Custom Error Format

If another project returns `messages`, normalize it once:

```ts
apix.transformResponse((ctx) => {
  const body = ctx.body

  if (!body.message && Array.isArray(body.messages)) {
    const first = body.messages[0]
    body.message = typeof first === 'string' ? first : first?.message ?? null
  }

  return body
})
```

### Switch Tabs By Error Group

```ts
const openErrorTab = () => {
  if (productForm.hasErrors(['name', 'sku', 'barcode'])) {
    activeTab.value = 'general'
    return
  }

  if (productForm.hasErrors(['settings.resource.limit', 'settings.weight.limit'])) {
    activeTab.value = 'limits'
    return
  }

  if (productForm.hasErrors(['items'])) {
    activeTab.value = 'items'
  }
}

try {
  await productForm.patch()
} catch {
  openErrorTab()
}
```

### Dirty Buttons

```vue
<el-button :disabled="!productForm.isDirty()" @click="productForm.reset()">
  Reset
</el-button>

<el-button type="primary" :disabled="!productForm.isDirty()" @click="productForm.patch()">
  Save
</el-button>
```

### Send Only Dirty Data

The package does not force this pattern, but you can do it explicitly:

```ts
await productForm.patch({
  body: productForm.getDirty(),
})
```

### Manual Error Handling

```ts
import { ApixError } from '@diephp/vue-model'

try {
  await productForm.patch()
} catch (error) {
  if (error instanceof ApixError) {
    if (error.httpCode === 422) {
      console.log(error.keys())
    }

    if (error.timeout) {
      console.log('Try again later')
    }
  }
}
```

### Locked Submit Button

```ts
const paymentForm = apix.create('/payments/charge', {
  immediate: false,
  locked: true,
  default: () => ({
    amount: null,
    card_id: null,
  }),
})
```

If the user clicks twice, the second request will not start while the first one is active.

### Abort Previous Search Request

Default behavior:

```ts
const search = apix.create('/products/search', {
  abort: true,
  watch: {
    only: ['query'],
    debounce: 200,
  },
  default: () => ({
    query: null,
    items: [],
  }),
})
```

When the user types quickly, the previous active request is aborted before the new one starts.

### Request Params From Route

```ts
const report = apix.create('/reports/monthly', {
  params: () => ({
    month: route.query.month,
    warehouse_id: route.query.warehouse_id,
  }),
  default: () => ({
    items: [],
    totals: {},
  }),
})
```

The callback runs before every request, so route/query values stay current.

### Response Wrapper

```ts
const profile = apix.create('/profile/current', {
  path: 'data.user',
  default: () => ({
    id: null,
    name: null,
    email: null,
  }),
})
```

Response:

```json
{
  "data": {
    "user": {
      "id": 15,
      "name": "Anna",
      "email": "anna@example.com"
    }
  }
}
```

Model data:

```ts
profile.data.name // "Anna"
```

## Merge Rules

### Initial data

```ts
data = default()
```

### `reload()`

```ts
data = merge(default(), responseData)
```

Use `reload()` when you want to rebuild data from server state.

### `send()` / `refresh()`

```ts
data = merge(currentData, responseData)
```

This avoids clearing form fields that the server does not return.

### Error response

```ts
data is not changed
message/errors are updated
```

This means if page 2 fails, old `items` stay visible unless you clear them manually:

```ts
onError: () => {
  tableModel.push({
    items: [],
  })
}
```

## TypeScript

```ts
interface ScannerForm {
  name: string | null
  hub_id: number | null
  enabled: boolean
}

const scannerForm = apix.create<ScannerForm>('/scanners/5', {
  default: () => ({
    name: null,
    hub_id: null,
    enabled: true,
  }),
})

scannerForm.data.name = 'Dock scanner'
```

Collections:

```ts
interface Option {
  id: number
  name: string
}

const options = apix.createCollection<Option>('/options/hubs')

options.data.forEach((option) => {
  console.log(option.name)
})
```

## Recommended Defaults

For edit forms:

```ts
apix.create('/resource/1', {
  default: () => ({ /* fields */ }),
})
```

For create forms:

```ts
apix.create('/resource', {
  immediate: false,
  default: () => ({ /* fields */ }),
})
```

For selectors:

```ts
apix.createCollection('/resource/options')
```

For uploads:

```ts
apix.createForm('/resource/upload')
```

For table filters:

```ts
apix.create('/resource/table', {
  only: ['name', 'pagination.page', 'pagination.onPage'],
  watch: {
    only: ['pagination.page', 'pagination.onPage'],
  },
})
```

## Notes

- The package is built around JSON data. Dirty/reset tracking is for JSON-like objects and arrays.
- Files and `FormData` are not tracked in snapshots.
- `only` and `omit` filter request payload, not server response.
- `response.only` and `response.omit` filter successful response data.
- Error response bodies update error state, not `model.data`.
- `model.data` is always the place for UI binding.
- Use `model.stop()` when creating models outside Vue component scope.

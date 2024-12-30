### resolve

#### resolve(`params`)

Resolve a provided Audius app URL to the API resource it represents.

Example:

```typescript
const { data: track } = await audiusSdk.resolve<Track>({
  url: "https://audius.co/camouflybeats/hypermantra-86216",
});

console.log(track);
```

#### Params

Create an object with the following fields and pass it as the first argument, as shown in the example above.

| Name  | Type     | Description                        | Required?    |
| :---- | :------- | :--------------------------------- | :----------- |
| `url` | `string` | The url of the resource to resolve | **Required** |

#### Returns

Returns a `Promise` containing an object with a `data` field. `data` is an object representing the resolved resource as described below.

```ts
Promise<{
  data: Track | Playlist | Album;
}>;
```

---

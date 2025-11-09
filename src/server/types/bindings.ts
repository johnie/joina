export type Bindings = {
  BUCKET: R2Bucket;
  RATE_LIMIT_KV: KVNamespace;
  PRODUCTION_URL?: string;
  ENVIRONMENT?: string;
};

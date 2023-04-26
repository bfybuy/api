/// <reference types="node" />
import { FastifyBaseLogger, FastifyHttp2SecureOptions } from 'fastify';
import { Http2SecureServer } from 'http2';
declare function app(options: FastifyHttp2SecureOptions<Http2SecureServer, FastifyBaseLogger>): Promise<import("fastify").FastifyInstance<Http2SecureServer, import("http2").Http2ServerRequest, import("http2").Http2ServerResponse, FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>>;
export default app;

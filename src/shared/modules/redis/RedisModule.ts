import { CacheModule, Global, Module } from "@nestjs/common"
import { RedisCacheService } from "./RedisService"
import * as redisStore from 'cache-manager-redis-store'

@Global()
@Module({
    imports: [
        CacheModule.register({
            ttl: 9000, // seconds
            isGlobal: true,
            store: redisStore,
            host: 'localhost',
            port: 6379,
        }),
    ],
    providers: [RedisCacheService],
    exports: [RedisCacheService]
})
export class RedisCacheModule {}
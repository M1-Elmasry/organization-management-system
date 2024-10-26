import Redis from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "../utils/constants";

class RedisClient {
	private client: Redis;

	constructor() {
		this.client = new Redis(`${REDIS_HOST}:${REDIS_PORT}`);

		this.client.on("error", (error: Error) => {
			console.log(`Error occured: ${error.message}`);
		});

		this.client.on("connect", (_error: Error) => {
			console.log(`redis server starts in ${REDIS_HOST}:${REDIS_PORT}`);
		});
	}

	async revokeToken(userId: string, token: string, expiration: number): Promise<void> {
		await this.client.set(`${userId}_${token}`, "revoked", "EX", expiration);
	}

	async isTokenRevoked(userId: string, token: string): Promise<boolean> {
		const result = await this.client.get(`${userId}_${token}`);
		return !!result;
	}
}

const redisClient = new RedisClient();
export default redisClient;

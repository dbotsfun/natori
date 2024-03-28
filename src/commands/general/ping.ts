import { type CommandContext, Declare, SubCommand } from "seyfert"
import graphqlRequest from "../../lib/gqlRequest"

const query = `
query {
	__typename
  }
`

@Declare({
	name: "ping",
	description: "Elyam latency",
})
export default class UserCommand extends SubCommand {
	async run(ctx: CommandContext) {
		const ws = ctx.client.gateway.latency
		const api = await this.getApiPing()
		const proxy = await this.getProxyPing(ctx)

		await ctx.write({
			content: `🌐 Gateway latency: ${ws}ms\n📡 Dbots api latency: ${api}ms\n🪝 Proxy latency: ${proxy}ms`,
		})
	}

	public async getApiPing() {
		const startDate = Date.now()
		await graphqlRequest(query)
		const endDate = Date.now()

		return startDate - endDate
	}

	public async getProxyPing(ctx: CommandContext) {
		const startDate = Date.now()
		await ctx.proxy.gateway.bot.get()
		const endDate = Date.now()

		return startDate - endDate
	}
}

import {
    type CommandContext,
    Declare,
    Options,
    SubCommand,
    createStringOption,
} from "seyfert"
import graphqlRequest, { type GraphQLError } from "../../lib/gqlRequest"

const query = `
mutation Approve($approveBotId: ID!) {
    approveBot(id: $approveBotId) {
      name
    }
  }
`

interface MutationResponseData {
    data: {
        approveBot: {
            name: string
        }
    }
}

const approveOptions = {
    id: createStringOption({
        description: "Bot ID",
        required: true,
    }),
}

@Declare({
    name: "approve",
    description: "approve a bot",
})
@Options(approveOptions)
export default class UserCommand extends SubCommand {
    async run(ctx: CommandContext<typeof approveOptions>) {
        const req = await graphqlRequest<MutationResponseData | GraphQLError>(
            query,
            { approveBotId: ctx.options.id },
            "Approve",
        )

        if (!req.data) {
            throw new Error(req.errors[0].message)
        }

        const webhook = await ctx.client.webhooks.fetch(process.env.WEBHOOK_ID!, process.env.WEBHOOK_TOKEN!);

        webhook.messages.write({
            body: {
                content: `${req.data.approveBot.name} has been approved by <@${ctx.author.id}>`
            }
        })

        return ctx.write({
            content: `Action: Approve ${req.data.approveBot.name}`,
        })
    }
}

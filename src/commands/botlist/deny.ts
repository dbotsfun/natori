import {
	type CommandContext,
	Declare,
	Options,
	SubCommand,
	createStringOption,
} from "seyfert"
import { denialReasonsPresets } from "../../lib/denialPresets"
import graphqlRequest, { type GraphQLError } from "../../lib/gqlRequest"

const query = `
    mutation Deny($input: RejectBotInput!) {
        rejectBot(input: $input) {
        	name
        }
    }
`

interface MutationResponseData {
	data: {
		rejectBot: {
			name: string
		}
	}
}

const denyOptions = {
	id: createStringOption({
		description: "Bot ID",
		required: true,
	}),
	reason: createStringOption({
		description: "Bot deny reason",
		required: true,
	}),
}

@Declare({
	name: "deny",
	description: "deny a bot",
})
@Options(denyOptions)
export default class UserCommand extends SubCommand {
	async run(ctx: CommandContext<typeof denyOptions>) {
		if (ctx.options.reason.startsWith("preset:")) {
			const preset = denialReasonsPresets.find(
				(p) => p.id === Number(ctx.options.reason.split(":")[1]),
			)

			if (!preset) throw new Error("invalid preset provided")

			ctx.options.reason = `${preset.reason} | ${preset.description}`
		}

		console.log(ctx.options.reason)

		const req = await graphqlRequest<MutationResponseData | GraphQLError>(
			query,
			{ input: { id: ctx.options.id, reason: ctx.options.reason } },
			"Deny",
		)

		if (!req.data) {
			throw new Error(req.errors[0].message)
		}

		return ctx.write({
			content: `Action: Deny ${req.data.rejectBot.name}\nReason: \`${ctx.options.reason}\``,
		})
	}
}

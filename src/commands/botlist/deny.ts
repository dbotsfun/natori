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

			if (!preset) {
				const validPresets = denialReasonsPresets.map(x => `\`${x.id}\`: ${x.reason} ||${x.description}||`).join("\n")
				throw new Error(`invalid preset. valid presets:\n${validPresets}`)
			}

			ctx.options.reason = `${preset.reason} | ${preset.description}`
		}

		const req = await graphqlRequest<MutationResponseData | GraphQLError>(
			query,
			{ input: { id: ctx.options.id, reason: ctx.options.reason } },
			"Deny",
		)

		if (!req.data) {
			throw new Error(req.errors[0].message)
		}

		// the code above is temporal
		const logsChannel = await ctx.client.channels.fetch("1218939832391303229", true);

		if (logsChannel.isTextGuild()) logsChannel.messages.write({
			content: `**${req.data.rejectBot.name}** has been denied by <@${ctx.author.id}>\n\nReason: \`${ctx.options.reason}\``
		})

		return ctx.write({
			content: `Action: Deny ${req.data.rejectBot.name}\nReason: \`${ctx.options.reason}\``,
		})
	}
}

const url = "https://api.dbots.fun"

export interface GraphQLError {
	errors: {
		message: string
	}[]
	data: null
}

export default async function graphqlRequest<T>(
	query: string,
	variables?: unknown,
	operationName?: string,
) {
	return (
		await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization:
					`Bearer ${process.env.SESSION_TOKEN}`,
			},
			body: JSON.stringify({
				query,
				variables,
				operationName,
			}),
		})
	).json() as T
}

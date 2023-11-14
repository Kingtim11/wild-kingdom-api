// from https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/

const asyncFilter = async (arr: any[], predicate: Function) => 
	arr.reduce(async (memo, e) => 
		[...await memo, ...await predicate(e) ? [e] : []]
	, []
);

export default asyncFilter;
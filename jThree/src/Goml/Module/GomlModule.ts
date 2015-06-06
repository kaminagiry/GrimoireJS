
interface GomlModule
{
	/**
	 * The name of this module.
	 * REQUIRED
	 */
	name:string;
	
	/**
	 * The number of order for execution.
	 * If this number is low, it will be executed faster.
	 * Default:1000
	 */
	order?:number;	
	
	
}

export = GomlModule;
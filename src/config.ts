

























export interface AdminDataLogger {
	info: (msg: string, ...args: unknown[]) => void;
	warn: (msg: string, ...args: unknown[]) => void;
	error: (msg: string, ...args: unknown[]) => void;
}




export interface AdminDataConfig {
	
	dataDir?: string;
	
	getRolePermissions?: (role: string) => string[];
	
	getLogger?: () => AdminDataLogger;
}


const defaultLogger: AdminDataLogger = {
	info: console.log.bind(console),
	warn: console.warn.bind(console),
	error: console.error.bind(console),
};

let config: AdminDataConfig = {};









export function configureAdminData(c: AdminDataConfig): void {
	config = { ...config, ...c };
}






export function getAdminDataConfig(): Required<AdminDataConfig> {
	return {
		dataDir: config.dataDir ?? process.cwd() + '/content/auth',
		getRolePermissions: config.getRolePermissions ?? ((_role: string) => ['read']),
		getLogger: config.getLogger ?? (() => defaultLogger),
	};
}





export function resetAdminDataConfig(): void {
	config = {};
}






export function getLogger(): AdminDataLogger {
	return getAdminDataConfig().getLogger();
}

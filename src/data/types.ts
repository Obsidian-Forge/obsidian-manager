export interface ManagerPlugin {
	id: string;
	name: string;
	desc: string;
	group: string;
	tags: string[];
	enabled: boolean;
	delay: number;
}

export interface Type {
	id: string;
	name: string;
	color: string;
}

export interface Tag {
	id: string;
	name: string;
	color: string;
}


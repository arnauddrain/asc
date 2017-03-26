export class Addiction {
	public activated: boolean;

	constructor(public id: number, public name: string, activated: any) {
		if (activated === "false")
			this.activated = false;
		else
			this.activated = activated;
	}
}
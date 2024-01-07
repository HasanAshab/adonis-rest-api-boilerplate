/**
 * Contract source: https://git.io/JfefG
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */
declare module '@ioc:Adonis/Core/Event' {
  import type User from 'App/Models/User';

	interface EventsList {
		registered: {
			user: User;
			version: string;
			method: 'internal' | 'social';
		};
	}
	
	interface Listener<Event extends keyof EventsList> {
	  dispatch(event: EventsList[Event]): void | Promise<void>;
	}
}

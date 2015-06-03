import stateStore from 'state-store';

export default function () {
	return {
		componentWillMount: function () {
			this.Stores = {};
			for (var storeName in stateStore.Stores) {
				var store = stateStore.Stores[storeName]
				if (typeof (store.fetch) === 'function') {
					this.Stores[storeName] = {
						_store: store,
						_subscriptions: {},
						_onSubscriptionChange: function (oldValue, newValue) {
							if (this.isMounted()) {
								this.forceUpdate();
							}
						}.bind(this),
						fetch: function (id, options) {
							if (typeof (id) === 'object') {
								id = JSON.stringify(id);
							}
							var e = this._store.fetch(id, options);
							if (e && !this._subscriptions[id]) {
								this._subscriptions[id] = e.subscribe(this._onSubscriptionChange);
							}
							return e;
						},
						fetchRange: function (ids, options) {
							var items = [];//this._store.fetchRange(ids, options);
							_.each(ids, function (id) {
								if (typeof (id) === 'object') {
									id = JSON.stringify(id);
								}
								var e = this._store.fetch(id, options);
								items.push(e);
								if (e && !this._subscriptions[id]) {
									this._subscriptions[id] = e.subscribe(this._onSubscriptionChange);
								}
							}.bind(this));
							return items;
						},
						createRemote: store.createRemote.bind(store),
						updateRemote: store.updateRemote.bind(store),
						deleteRemote: store.deleteRemote.bind(store)
					}
				}
			}
		},
		componentWillUnmount: function () {
			for (var storeName in this.Stores) {
				var store = this.Stores[storeName];
				for (var id in store._subscriptions) {
					store._subscriptions[id]();
				}
			}
		}
	};

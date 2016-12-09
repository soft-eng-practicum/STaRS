angular.module('app.services', [])

.factory('$service', function($http) {
	return {
		login: function(username, password) {
			if(angular.equals(username, 'GGCStars') && angular.equals(password, '12345')) {
				return true;
			} else {
				return false;
			}
		}
	}
})

.service('$pouchDB', function($rootScope, $q) {
	var changeListener;

	this.setLocalDatabase = function(databaseName) {
		var database = new PouchDB(databaseName);
		return database;
	}

	this.setRemoteDatabase = function(databaseName) {
		var database = new PouchDB(databaseName);
		return database;
	}

	this.startListening = function() {
		changeListener = database.changes({
			live: true,
			include_docs: true
		}).on('change', function(change) {
			if(!change.deleted) {
				$rootScope.$broadcast('$pouchDB:change', change);
			} else {
				$rootScope.$broadcast('$pouchDB:delete', change);
			}
		});
	}

	this.stopListening = function() {
		changeListener.cancel();
	}

	this.sync = function(remoteDatabase) {
		database.sync(remoteDatabase, {live:true, retry:true});
	}

	this.save = function(jsonDoc) {
		var deffered = $q.defer();
		if(!jsonDoc._id) {
			database.post(jsonDoc).then(function(res) {
				deffered.resolve(res);
			}).catch(function(err) {
				deffered.reject(err);
			});
		}
		return deffered.promise;
	}

	this.delete = function(docId, docRevision) {
		return database.remove(docId, docRevision);
	}

	this.get = function(docId) {
		return database.get(docId);
	}

	this.destroy = function() {
		database.destroy();
	}
});
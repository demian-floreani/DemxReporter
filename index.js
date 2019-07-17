var _ = require('lodash');

function createSummary(summary) {    
    var executions = [];
    summary.run.executions.forEach(function(execution) {
		if(execution.response.code >= 400) {
			executions.push({
				'TestId': execution.item.id,
				'Request': {
					'Path': execution.request.url.path
				},
				'Response': {
					'Status': execution.response.status,
					'Code': execution.response.code,
					'Stream': execution.response.stream
				}
			});
		}
    });

    // Build main object with just the bits needed plus the slimmed down failures
    var result = {};
    Object.assign(result, {
        'Collection': {
            'Info': {
                'Name': summary.collection.name,
                'Id': summary.collection.id
            }
        },
        'Run': {
            'Stats': {
                "Requests" : summary.run.stats.requests,
                "Assertions" : summary.run.stats.assertions
            },
            'Executions': executions,
            'Timings' : summary.run.timings
        }
    });
    return result;
}

module.exports = function(newman, options) {
    newman.on('beforeDone', function(err, data) {
        if (err) { return; }

        newman.exports.push({
            name: 'newman-reporter-demx',
            default: 'summary.json',
            path:  options.jsonExport,
            content: JSON.stringify(createSummary(data.summary))
        });
    });
};
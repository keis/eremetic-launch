var launchTask = require('eremetic-task')
var ESPoll = require('espoll')
var through2 = require('through2')
var ESClient = require('elasticsearch').Client

function formatLog() {
  return through2.obj(function (obj, enc, callback) {
    this.push(obj._source['@timestamp'] + ' ' + obj._source.message + '\n')
    callback()
  })
}

module.exports = function run(options, callback) {
  var task = options.task
  var eremetic = options.eremetic
  var elastic = options.elastic
  launchTask(eremetic, task)
    .then(function (task) {
      console.error("Running as", task.id)
      var client = new ESClient({host: elastic, log: 'error'})
      var ep = new ESPoll({
        client: client,
        index: 'logstash-*',
        delay: 1000,
        query: { term: {'mesos.task_id.raw': task.id} }
      })
      ep.pipe(formatLog()).pipe(process.stdout)
      task.on('status', function (s) {
        console.error('New status of task is', s.status)
      })
      task.on('done', function () {
        // Queue a final read of log data and then exit
        ep._read()
        ep.stop()
        ep.on('end', function () {
          callback()
        })
      })
      task.on('error', function (err) {
        ep.close()
        callback(err)
      })
    })
    .catch(function (err) {
      callback(err)
    })
}


var run = require('./')
var eremetic = process.env['EREMETIC']
var elastic = process.env['EREMETIC_ELASTIC']

function main() {
  var cli = require('meow')({
    help: 'Usage: eremetic-launch -c <cpu> -m <mem> [image] command'
  }, {
    alias: {
      c: 'cpu',
      m: 'mem'
    }
  })
  var image = 'busybox'
  var command
  if (cli.input.length === 2) {
    image = cli.input[0]
    command = cli.input[1]
  } else if (cli.input.length === 1) {
    command = cli.input[0]
  } else {
    console.log(cli)
    cli.showHelp()
    process.exit(1)
  }

  var task = {
    "task_cpu": Number(cli.flags.cpu),
    "task_mem": Number(cli.flags.mem),
    "docker_image": image,
    "command": command
  }

  run({
    eremetic: eremetic,
    elastic: elastic,
    task: task
  }, function (err) {
    if (err) {
      console.error(err)
      process.exit(1)
      return
    }
    process.exit()
  })
}

if (require.main === module) {
  main()
}

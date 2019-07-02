const chalk = require('chalk')
const yargs = require('yargs')
const request = require('request')
const fs = require('fs');
host = "http://localhost:4000";
path = "/Users/bogdanabaev/RandomProgramming/node/notes/CLI/"

const sendQuery = function (query, username, signup) {
    if (username) {
        request.post({
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            url: host + "/graphql",
            body: JSON.stringify({ "query": query })
        }, (err, result) => {
            if (err) {
                console.log(err)
                return null;
            } else {
                if (signup) {
                    fs.writeFileSync(path + '.username.txt', username);
                }
                return result.body;
            }
        })
    } else {
        console.log("No username found, you need to sign up!");
        return null;
    }
}


yargs.command({
    'command': 'start <project>',
    'describe': 'work on project',

    handler: function (argv) {
        var username = '';
        try {
            username = fs.readFileSync(path + '.username.txt').toString();
            var query = `{
                time(username: "${username}"){
                start(projectName: "${argv.project}")
              }
            }`;
        } catch (e) {
            console.log(e);
            return;
        }
        sendQuery(query, username);
    }
});


yargs.command({
    'command': 'end',
    'describe': 'finish working on current project',

    handler: function (argv) {
        var username = '';
        try {
            username = fs.readFileSync(path + '.username.txt').toString();
            var query = `{
                time(username: "${username}"){
                end
              }
            }`;
        } catch (e) {
            console.log("You need to sign up first");
            return;
        }
        sendQuery(query, username);
    }
});

yargs.command({
    'command': 'create <project>',
    'describe': 'create new project',
    handler: function (argv) {
        var username = '';
        try {
            username = fs.readFileSync(path + '.username.txt').toString();
            var query = `{
                time(username: "${username}"){
                create(projectName: "${argv.project}")
              }
            }`;
        } catch (e) {
            console.log(e);
            return;
        }
        sendQuery(query, username);
    }
});

yargs.command({
    'command': 'delete <project>',
    'describe': 'delete project',
    handler: function (argv) {
        var username = '';
        try {
            username = fs.readFileSync(path + '.username.txt').toString();
            var query = `{
                time(username: "${username}"){
                remove(projectName: "${argv.project}")
              }
            }`;
        } catch (e) {
            console.log(e);
            return;
        }
        sendQuery(query, username);
    }
});

yargs.command({
    'command': 'ls',
    'describe': 'show existing projects',
    handler: function (argv) {
        var username = '';
        try {
            username = fs.readFileSync(path + '.username.txt').toString();
            var query = `{
                time(username: "${username}"){
                ls
              }
            }`;

        } catch (e) {
            console.log(e);
            return;
        }
        const body = sendQuery(query, username);
        console.log(body);
        if (body){
            body.data.time.ls.forEach((el)=>{
                console.log(el + '\t');
            })
        }
    }
});

yargs.command({
    'command': 'current',
    'describe': 'current project',
    handler: function (argv) {
        var username = '';
        try {
            username = fs.readFileSync(path + '.username.txt').toString();
            var query = `{
                time(username: "${username}"){
                current
              }
            }`;
        } catch (e) {
            console.log(e);
            return;
        }
        sendQuery(query, username);
    }
});

yargs.command({
    'command': 'report',
    'describe': 'report daily or weekly work progress',
    handler: function (argv) {
        var username = '';
        try {
            username = fs.readFileSync(path + '.username.txt').toString();
            var query = `{
                time(username: "${username}"){
                    report{ 
                        _id
                        timeSpent
                        workSessions{
                          duration
                          start{
                            year
                            month
                            day
                            time
                          }
                          finish{
                            year
                            month
                            day
                            time
                          }
                        }
                      }
              }
            }`;
        } catch (e) {
            console.log(e);
            return;
        }
        if (username) {
            request.post({
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                url: host + "/graphql",
                body: JSON.stringify({ "query": query })
            }, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    const dict = JSON.parse(result.body).data.time.report;
                    for (var project in dict) {
                        console.log(project);
                        console.log("\nProject: " + dict[project]._id);
                        var minSpent = dict[project].timeSpent;
                        var hr = parseInt(minSpent / 60);
                        var min = minSpent % 60;
                        console.log(`Total time: ${hr}:${min}`);
                        console.log("Work sessions:\n")
                        dict[project].workSessions.forEach(session => {
                            console.log(`Start:${session.start.day}/${session.start.month} at ${session.start.time}`);
                            console.log(session.finish ? `Finish:${session.finish.day}/${session.finish.month} at ${session.finish.time}` : "In progress");
                            console.log(session.duration ? `Duration: ${parseInt(session.duration / 60)}:${session.duration % 60} ` : "");
                            console.log("-------------------------------------\n");
                        });
                    }
                }
            })
        } else {
            console.log("You need to sign up");
        }
    }
});


yargs.command({
    'command': 'signup <username>',
    'describe': 'signup',
    handler: function (argv) {
        var query = `{
            signup(username: "${argv.username}")
        }`;
        const res = sendQuery(query, argv.username, true);
        if (res) {
            fs.writeFileSync(path + '.username.txt', argv.username);
        }

    }
});




yargs.parse()



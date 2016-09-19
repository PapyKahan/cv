"use strict";
var page = require('webpage').create(),
    system = require('system'),
    fs = require('fs'),
    async = require('async'),
    address, size, pageWidth, pageHeight;

if (system.args.length < 3 || system.args.length > 5) {
    console.log('Usage: index.js path outputPath [paperwidth*paperheight|paperformat] [zoom]');
    console.log('  paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
    phantom.exit(1);
} else {
    var directory = system.args[1];
    var outputDirectory = system.args[2];
    fs.makeTree(outputDirectory);

    var files = fs.list(directory).filter(function(item) {
        return item.match(/\.html/);
    });

    page.viewportSize = { width: 600, height: 600 };
    if (system.args.length > 3) {
        size = system.args[3].split('*');
        page.paperSize = size.length === 2 ? { width: size[0], height: size[1], margin: '0px' }
                                           : { format: system.args[3], orientation: 'portrait', margin: '1cm' };
    }
    if (system.args.length > 4) {
        page.zoomFactor = system.args[4];
    }

    console.log("Creating working queue.");
    
    var jobs = async.queue(function(task, callback) {
        var filePath = directory + "/" + task.fileName;
        var output = outputDirectory + "/" +  task.fileName.substr(0, task.fileName.length - 5) + ".pdf";
        console.log("Processing file: " + filePath + " > " + output);
        page.open(filePath, function (status) {
            if (status !== 'success') {
                console.log('Unable to load the address!');
                phantom.exit(1);
            } else {
                window.setTimeout(function () {
                    page.render(output);
                    callback();
                }, 200);
            }
        });
    });

    jobs.pause();

    files.forEach(function(item) {
        jobs.push({fileName: item}, function(err) {
            if (err) {
                throw err;
            }
            console.log("'" + item + "' has been generated.");
        });
    });

    jobs.drain = function() {
        phantom.exit();
    }

    jobs.resume();
}
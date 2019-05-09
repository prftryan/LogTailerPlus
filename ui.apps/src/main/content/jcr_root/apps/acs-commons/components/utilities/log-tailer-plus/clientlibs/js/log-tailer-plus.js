var LogTailerPlus = {

	/* Built-in Filters (see lowercase classes in css for details) */
    LOG_LEVELS: ['ERROR','WARN','INFO','DEBUG','TRACE'],

	/* LogTailerPlus Constants */
    HIDDEN_CLASS:	'hidden',

    PANEL_CONTAINER_CLASS: 'panel-container',
    LOG_PANEL_CLASS: "log-panel",
    LOG_TITLE_CLASS: 'log-title',
    LOG_RESULT_CLASS: 'log-result',
    ADVANCED_DIALOG_CLASS: 'advanced-properties-dialog',

	/* Buttons */
    ADD_TAILER_CLASS: 'addTailer',
    ADVANCED_LOG_CONFIG_CLASS: 'advanced-log-config',
    REMOVE_TAILER_CLASS: 'removeTailer',

	/* A Stack (in this context) is anything not matching filters.  It is collapsible by default. */
    STACK_CLASS: 'stack',
    STACK_CLOSED_CLASS: 'closed',
    STACK_ICON_CLASS: 'stack-icon',
    STACK_START_CLOSED: false,

    SPLITTER_CLASS: 'splitter',//also used in resizer.

    /* Default Values */
    DEFAULT_REFRESH: 5,//seconds
    DEFAULT_LOGGER: '/logs/error.log',
    DEFAULT_GREP: "*",


    /* Data Attributes Constants */
    DATA_LOGGER: 'data-logger',
    DATA_REFRESH: 'data-refresh',
    DATA_GREP: 'data-grep',

	/* SlingLog Constants */
    LOGGER_SERVLET_PATH: '/system/console/slinglog/tailer.txt',
    LOGGER_GREP_PARAM: 'grep',
    LOGGER_TAIL_PARAM: 'tail',
    LOGGER_NAME_PARAM: 'name',

    /* JQuery Resize Constants*/
    RESIZER_HANDLE_SELECTOR: 'handleSelector',
    RESIZER_RESIZE_HEIGHT: 'resizeHeight',
    ENABLE_RESIZE: true,



    init: function () {
        LogTailerPlus.addLog(LogTailerPlus.DEFAULT_LOGGER,LogTailerPlus.DEFAULT_REFRESH,LogTailerPlus.DEFAULT_GREP);

        $(document).on("click","."+LogTailerPlus.STACK_ICON_CLASS,function(event){
			var iconSpan = $(event.currentTarget);
            var parentSpan = iconSpan.parent();
            if( !parentSpan.hasClass(LogTailerPlus.STACK_CLOSED_CLASS) ){
                parentSpan.addClass(LogTailerPlus.STACK_CLOSED_CLASS);
            }else{
                parentSpan.removeClass(LogTailerPlus.STACK_CLOSED_CLASS);
            }


        });

        $(document).on("click","."+LogTailerPlus.ADVANCED_LOG_CONFIG_CLASS, function(){
			LogTailerPlus.launchDialog(this);
        }),

        $(document).on("click","."+LogTailerPlus.REMOVE_TAILER_CLASS, function(){
		    LogTailerPlus.removeLog(this);
		});

		$(document).on("click","."+LogTailerPlus.ADD_TAILER_CLASS,function(){
            var selectField = $(".selectedLog").get(0);
            var slingHome = "/";//selectField.getAttribute(LogTailerPlus.DATA_SLING_HOME);
            var selectedValue = selectField.selectedItem && selectField.selectedItem.value ? selectField.selectedItem.value:"";
            if( selectedValue && selectedValue.length > 0 ){
                var logName = selectedValue.startsWith("/") ? selectedValue:slingHome+selectedValue;
                LogTailerPlus.addLog(logName,LogTailerPlus.DEFAULT_REFRESH,"*");
            }else{
				alert("No log was selected to add.");
            } 
        });
	},

    getHtmlTemplate: function(logger,refresh,grep){
        return	"<div class='"+LogTailerPlus.LOG_PANEL_CLASS+"' "+LogTailerPlus.DATA_LOGGER+"='"+logger+"' "+LogTailerPlus.DATA_REFRESH+"='"+refresh+"' "+LogTailerPlus.DATA_GREP+"='"+grep+"'>"+
            		"<div class='log-panel-header'>"+
                    	"<div class='granite-actionbar foundation-collection-actionbar'>" +
                        	"<div class='granite-actionbar-centerwrapper'>" +
                            	"<div class='granite-actionbar-center'>"+
                                	"<span class='granite-title "+LogTailerPlus.LOG_TITLE_CLASS+"' role='heading' aria-level='1'>"+logger+"</span>" +
                                "</div>" +
                            "</div>" +
        					"<div class='granite-actionbar-left'></div>" +
					   		"<div class='granite-actionbar-right'>" +
                                "<button is='coral-button' class='"+LogTailerPlus.ADVANCED_LOG_CONFIG_CLASS+"' icon='properties'></button>"+
					   			"<button is='coral-button' icon='closeCircle' iconsize='S' class='"+LogTailerPlus.REMOVE_TAILER_CLASS+"'></button>" +
                        	"</div>" +
                    	"</div>" +
                	"</div>"+
                    "<div class='"+LogTailerPlus.LOG_RESULT_CLASS+"'></div>"+
				"</div>";
    },

    getSplitterTemplate: function(logger){
        return "<div class='"+LogTailerPlus.SPLITTER_CLASS+" "+LogTailerPlus.HIDDEN_CLASS+"' "+LogTailerPlus.DATA_LOGGER+"='"+logger+"' />"
    },
    getDefaultLogLevelRegex: function(logLevel){
		return new RegExp("([^\\n<>a-zA-Z]+[*]?"+logLevel+"[*]?[^\\n]+)","g");
    },
    launchDialog: function(btn){
        var dialog = $("."+LogTailerPlus.ADVANCED_DIALOG_CLASS).get(0);
        if( dialog ){
            var panel = $(btn).closest("."+LogTailerPlus.LOG_PANEL_CLASS);
            var logName = panel.attr(LogTailerPlus.DATA_LOGGER);
            var refresh = panel.attr(LogTailerPlus.DATA_REFRESH);
            var grep = panel.attr(LogTailerPlus.DATA_GREP);
            dialog.set({
                header: {
                    innerHTML: "Advanced Configuration: <b>"+logName+"</b>"
                },
                content: {
                    innerHTML: "Refresh: "+refresh + "<br/>Grep: "+grep
                }
            });
            dialog.show();
        }else{
            console.log("Error: No Dialog Found");
        }
    },

    queryLog: function($logPanel) {
        var logName = $logPanel.attr(LogTailerPlus.DATA_LOGGER);
        if( logName && logName.length > 0 ){
            var queryData = {};
            var grep = $logPanel.attr(LogTailerPlus.DATA_GREP);
            if( !grep || grep === undefined || grep === null || grep.length === 0){
				grep = LogTailerPlus.DEFAULT_GREP;
            }
            queryData[LogTailerPlus.LOGGER_NAME_PARAM] = logName;
            queryData[LogTailerPlus.LOGGER_TAIL_PARAM] = 100;
            queryData[LogTailerPlus.LOGGER_GREP_PARAM] = grep;
            $.get(LogTailerPlus.LOGGER_SERVLET_PATH,queryData).success( function(responseBody)
            {
                responseBody = LogTailerPlus.getDelta($logPanel,responseBody);
				responseBody = LogTailerPlus.formatResponse(responseBody);                
                $logPanel.children("."+LogTailerPlus.LOG_RESULT_CLASS).append(responseBody);
            });

        }else{
            console.log("Warn: No Log Name found to query");
        }
    },
    formatResponse: function(logContents){
        var lines = logContents.split("\n");
        var newLines = [];
        var emptyLines = [];
        for ( var i = 0 ; i < lines.length; i++ ){
			var line = lines[i];
            var replaced = 0;
            for( var x=0; x < LogTailerPlus.LOG_LEVELS.length; x++ ){
            	var logLevel = LogTailerPlus.LOG_LEVELS[x];
                var regex = LogTailerPlus.getDefaultLogLevelRegex(logLevel);

            	if( logLevel && logLevel.length > 0){          
                    line = line.replace(regex, 
                       	function(match,$1,index){
							replaced++;
                        	return "<span class='"+logLevel.toLowerCase()+"'>"+$1+"</span>"
                    	});                   
                }                
        	}
            if( replaced == 0 ){
                if( line && line.length > 0){ 
                	if( emptyLines.length === 0){
                        var stackClass = LogTailerPlus.STACK_CLASS;
                        if( LogTailerPlus.STACK_START_CLOSED ){
							stackClass += " "+LogTailerPlus.STACK_CLOSED_CLASS;
                        }
                		emptyLines.push("<span class='"+LogTailerPlus.STACK_CLASS+"'><span class='"+LogTailerPlus.STACK_ICON_CLASS+"'></span>");
               	 	}	
	                emptyLines.push(line);
                }
            }else{
                if(emptyLines.length > 0){
					emptyLines.push("</span>");
	                newLines=newLines.concat(emptyLines);
                    emptyLines = [];
                }
                newLines.push(line);
            }
        }
        if( emptyLines.length > 1){
            //concatinate any remaining emptyLines ( > 1 because 1st element is always <span...)
            emptyLines.push("</span>");
			newLines = newLines.concat(emptyLines);
        }

        return newLines.join("\n");

    },
    getDelta: function($panel, newContent){
		//if there is no content, new content is delta...
        var delta = newContent;

        var existingContent = $panel.children("."+LogTailerPlus.LOG_RESULT_CLASS).text();
        if( existingContent ){
            //if there is content, lets get the minimum set of new data.
			var strArr = existingContent.split("\n");
            var len = strArr.length - 1;
            var lastLine = strArr[len];
            //loop from bottom up until we find a non-empty line
            while( len-- > 0 && (!lastLine || lastLine.length == 0) ){
                lastLine = strArr[len]
            }
            //use that bottom line to find index of new log contents (if any)
            if( lastLine && lastLine.length > 0 ){
                if( newContent.indexOf(lastLine) >= 0 ){
	                delta = newContent.substr(newContent.indexOf(lastLine)+lastLine.length);
                }
            }
        }
        return delta;
    },
    addLog: function(logName,refresh,grep) {
        console.log(logName,refresh,grep);
        var hasExisting = $("."+LogTailerPlus.LOG_PANEL_CLASS+"["+LogTailerPlus.DATA_LOGGER+"='"+logName+"']").length;
        if( hasExisting === 0 ){ // no logs with this path have been added...
            var $logPanel =  $(LogTailerPlus.getHtmlTemplate(logName,refresh,grep));
            var $splitter = $(LogTailerPlus.getSplitterTemplate(logName));
            var numLogs = $("."+LogTailerPlus.LOG_PANEL_CLASS).length;
            //$splitter not in document (yet) and wont be affected..
            $(".splitter").removeClass("hidden");

            LogTailerPlus.queryLog($logPanel);
            $("."+LogTailerPlus.PANEL_CONTAINER_CLASS).append($logPanel);
            $("."+LogTailerPlus.PANEL_CONTAINER_CLASS).append( $splitter);
            //if we want to use jquery-resize, set variable above...
        	if( LogTailerPlus.ENABLE_RESIZE === true ){
                var splitterSelector = "."+LogTailerPlus.SPLITTER_CLASS+"["+LogTailerPlus.DATA_LOGGER+"='"+logName+"']";
                var data = {}
					data[LogTailerPlus.RESIZER_HANDLE_SELECTOR] = splitterSelector;
					data[LogTailerPlus.RESIZER_RESIZE_HEIGHT] = false;
                $($logPanel).resizable(data);
            }

            if( refresh && refresh > 0 ){
	            setInterval(function(){
                	LogTailerPlus.queryLog($logPanel);
            	},refresh*1000);
            }


        }else{//that logs already there - why tail it twice!
			alert(logName + " is already being tailed.");
        }	
    },

    removeLog: function(button){
        var numPanels = $("."+LogTailerPlus.LOG_PANEL_CLASS).length;
        var $panel = $(button).parents('.'+LogTailerPlus.LOG_PANEL_CLASS);
        var logger = $panel.attr(LogTailerPlus.DATA_LOGGER);
		$panel.siblings("."+LogTailerPlus.SPLITTER_CLASS+"["+LogTailerPlus.DATA_LOGGER+"='"+logger+"']").first().remove();
        $panel.remove();

    }
};

jQuery(document).ready(LogTailerPlus.init);
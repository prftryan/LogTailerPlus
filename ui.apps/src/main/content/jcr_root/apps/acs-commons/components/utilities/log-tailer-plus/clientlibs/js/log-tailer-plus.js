//TODO: Write a log panel class to make frequent children/property requests easier.
LogTailerPlus = {
    init: () => {
    //ToDo: Preserve open logs from session (if any) and if not load error.log...
        LogTailerPlus.addLogPanel(LogTailerPlus.Constants.DEFAULT_LOGGER,
            LogTailerPlus.Constants.DEFAULT_REFRESH,
            LogTailerPlus.Constants.DEFAULT_GREP,
            LogTailerPlus.Constants.DEFAULT_SCROLL);

        $(document).on("click","."+LogTailerPlus.Constants.STACK_ICON_CLASS, (event) => {
            LogTailerPlus.toggleStack($(event.currentTarget).parent());
        });

        $(document).on("click","."+LogTailerPlus.Constants.ADVANCED_LOG_CONFIG_CLASS, (event) => {
			LogTailerPlus.launchDialog(event.currentTarget);
        }),

        $(document).on("click","."+LogTailerPlus.Constants.REMOVE_TAILER_CLASS, (event) => {
		    LogTailerPlus.removeLogPanel(event.currentTarget);
		});

        $(document).on("change","."+LogTailerPlus.Constants.SCROLL_SWITCH_CLASS,(event) => {
            LogTailerPlus.toggleScroll(event.currentTarget);
        });

		$(document).on("click","."+LogTailerPlus.Constants.ADD_TAILER_CLASS,() => {
            var selectedValue = LogTailerPlus.getSelectedLogger();
            if( selectedValue.length > 0 ){
                var logName = selectedValue.startsWith("/") ? selectedValue:"/"+selectedValue;
                LogTailerPlus.addLogPanel(   logName,
                                        LogTailerPlus.Constants.DEFAULT_REFRESH,
                                        LogTailerPlus.Constants.DEFAULT_GREP,
                                        LogTailerPlus.Constants.DEFAULT_SCROLL);
            }else{
				alert("No log was selected to add.");
            } 
        });
	},

    getHtmlTemplate: (logger,refresh,grep,scroll) => {
        var checked = scroll === LogTailerPlus.Constants.SCROLL_PIN ? 'checked':'';
        return	`<div class='${LogTailerPlus.Constants.LOG_PANEL_CLASS}'
                    ${LogTailerPlus.Constants.DATA_LOGGER}='${logger}'
                    ${LogTailerPlus.Constants.DATA_REFRESH}='${refresh}'
                    ${LogTailerPlus.Constants.DATA_GREP}='${grep}'
                    ${LogTailerPlus.Constants.DATA_SCROLL}='${scroll}'>
            		<div class='log-panel-header'>
                    	<div class='granite-actionbar foundation-collection-actionbar'>
                        	<div class='granite-actionbar-centerwrapper'>
                            	<div class='granite-actionbar-center'>
                                	<span class='granite-title ${LogTailerPlus.Constants.LOG_TITLE_CLASS}'
                                	        role='heading' aria-level='1'>${logger}</span>
                                </div>
                            </div>
        					<div class='granite-actionbar-left'>
        					    <coral-switch value="${LogTailerPlus.Constants.SCROLL_PIN}" class='${LogTailerPlus.Constants.SCROLL_SWITCH_CLASS}' ${checked}></coral-switch>
                                <coral-icon id="pinOff" icon="pinOff" size="S" title="Select to pin scroll at current location"></coral-icon>
        					</div>
					   		<div class='granite-actionbar-right'>
                                <button is='coral-button' icon='properties' iconsize='S'
                                    class='${LogTailerPlus.Constants.ADVANCED_LOG_CONFIG_CLASS}'></button>
					   			<button is='coral-button' icon='closeCircle' iconsize='S'
					   			    class='${LogTailerPlus.Constants.REMOVE_TAILER_CLASS}'></button>
                        	</div>
                    	</div>
                	</div>
                    <div class='${LogTailerPlus.Constants.LOG_RESULT_CLASS}'></div>
				</div>`
    },
    /*
        a template used for the resizing splitter (jquery resize)
        also serves as divider for between loggers if multiple selected.
    */
    getSplitterTemplate: (logger) => {
        return `<div class='${LogTailerPlus.Constants.SPLITTER_CLASS} ${LogTailerPlus.Constants.HIDDEN_CLASS}'
                    ${LogTailerPlus.Constants.DATA_LOGGER}='${logger}' />`
    },
    /*
        Utility function to retrieve whatever is currently selected in the "add log" form.
    */
    getSelectedLogger: ()=> {
        var selected = "";
        var selectField = $("."+LogTailerPlus.Constants.SELECTED_LOG_CLASS).get(0);
        if( selectField.selectedItem && selectField.selectedItem.value
                && selectField.selectedItem.value.length > 0){
            selected = selectField.selectedItem.value;
        }
        return selected;
    },
    /* Standard/OOTB Logging format Regex for log levels - for use with built-in highlighting support */
    getDefaultLogLevelRegex: (logLevel) => {
		return new RegExp("([^\\n<>a-zA-Z]+[*]?"+logLevel+"[*]?[^\\n]+)","g");
    },
    /* to update logging configs, we set data attributes for the given configurations that the tailLog will
        read from automagically
     */
    launchDialog: (btn) => {
        var dialog = $("."+LogTailerPlus.Constants.ADVANCED_DIALOG_CLASS).get(0);
        var $panel = $(btn).closest("."+LogTailerPlus.Constants.LOG_PANEL_CLASS);

        if( !dialog ){
            //first click, lets create the dialog on the fly.
            dialog = new Coral.Dialog().set({
                class: LogTailerPlus.Constants.ADVANCED_DIALOG_CLASS,
                content: {
                    innerHTML: LogTailerPlus.generateDialogForm($panel).prop('outerHTML')
                },
                footer: {
                    innerHTML: `<button is="coral-button" variant="secondary" coral-close>Cancel</button><button is="coral-button" variant="primary" coral-close>Update</button>`
                }
            });
            dialog.on("close",()=>{
                    console.log("Closed");
            });
            $("."+LogTailerPlus.Constants.PANEL_CONTAINER_CLASS).append(dialog);
        }
        var logName = $panel.attr(LogTailerPlus.Constants.DATA_LOGGER);
        dialog.set({
            header: {
                innerHTML: "Advanced Configuration: <b>"+logName+"</b>"
            }
        });
        $("input[name="+LogTailerPlus.Constants.DATA_LOGGER+"]").val(logName);//set the hidden field value.
        dialog.show();
    },
    generateDialogForm: ($panel) => {
        var $dialogWrapper = $(`<section class="coral-Form-fieldset"></section>`);
        $dialogWrapper.append(LogTailerPlus.createFormInput("Logger:" ,
                                            LogTailerPlus.Constants.DATA_LOGGER,
                                            $panel.attr(LogTailerPlus.Constants.DATA_LOGGER),
                                            true));
        $dialogWrapper.append(LogTailerPlus.createFormInput("Refresh:",
                                            LogTailerPlus.Constants.DATA_REFRESH,
                                            $panel.attr(LogTailerPlus.Constants.DATA_REFRESH),
                                            false));
        $dialogWrapper.append(LogTailerPlus.createFormInput("GREP:",
                                            LogTailerPlus.Constants.DATA_GREP,
                                            $panel.attr(LogTailerPlus.Constants.DATA_GREP),
                                            false));
        var $dialogForm = $(`<form class='${LogTailerPlus.Constants.ADV_LOG_CONFIG_FORM} ${LogTailerPlus.Constants.CORAL_FORM_CLASS}'></form>`);
        $dialogForm.append($dialogWrapper);
        return $dialogForm;
    },
    createFormInput: (label,name,value,readonly) => {
        var readonlyStr = readonly === true ? "readonly":'';
        var wrapper = $(`<div class="coral-Form-fieldwrapper"></div>`);
        wrapper.append(`<label class="coral-Form-fieldlabel">${label}</label>`);
        wrapper.append(`<input is="coral-textfield" name="${name}" value="${value}" ${readonlyStr}>`);
       return wrapper;
    },
    /* Use the switch/btn to toggle the data-scroll attribute between pin and follow */
    toggleScroll: (btn) => {
        var $logPanel = $(btn).closest("."+LogTailerPlus.Constants.LOG_PANEL_CLASS);
        var newValue = btn.checked === true ?
            LogTailerPlus.Constants.SCROLL_PIN:LogTailerPlus.Constants.SCROLL_FOLLOW;
        $logPanel.attr(LogTailerPlus.Constants.DATA_SCROLL,newValue);
    },
    /* Any content that doesn't match built-in or user highlighting is identified as "stack"
        and can be collapsed.  This is simple class toggler for that (CSS Based) functionality.
    */
    toggleStack: (stack) => {
        if( !stack.hasClass(LogTailerPlus.Constants.STACK_CLOSED_CLASS) ){
            stack.addClass(LogTailerPlus.Constants.STACK_CLOSED_CLASS);
        }else{
            stack.removeClass(LogTailerPlus.Constants.STACK_CLOSED_CLASS);
        }
    },
    /* get request to the tailer.txt OOTB logging service */
    queryLog: ($logPanel) => {
        var logName = $logPanel.attr(LogTailerPlus.Constants.DATA_LOGGER);
        var queryReturn;
        if( logName && logName.length > 0 ){
            var queryData = {};
            var grep = $logPanel.attr(LogTailerPlus.Constants.DATA_GREP);
            if( !grep || grep === undefined || grep === null || grep.length === 0){
				grep = LogTailerPlus.Constants.DEFAULT_GREP;
            }
            queryData[LogTailerPlus.Constants.LOGGER_NAME_PARAM] = logName;
            queryData[LogTailerPlus.Constants.LOGGER_TAIL_PARAM] = 100;
            queryData[LogTailerPlus.Constants.LOGGER_GREP_PARAM] = grep;
            queryReturn = $.get({
                url: LogTailerPlus.Constants.LOGGER_SERVLET_PATH,
                data: queryData,
                dataType:"text",
                //This fixes an odd firefox issue due to tailer.txt setting wrong mime-type in its response...
                beforeSend: (xhr) => {
                    if(xhr && xhr.overrideMimeType){
                        xhr.overrideMimeType("text/plain;charset=UTF-8");
                    }
                }
            });
        }else{
            console.log("Warn: No Log Name found to query");
            queryReturn = Promise.reject();
        }
        return queryReturn;
    },
    /* This method will take the log response (plain text) and wrap contents with span's and classes based on
       both pre-set highlighting rules (TODO: as well as authored)
    */
    formatResponse: (logContents) => {
        var lines = logContents.split("\n");
        var newLines = [];
        var emptyLines = [];
        for ( var i = 0 ; i < lines.length; i++ ){
			var line = lines[i];
            var replaced = 0;
            for( var x=0; x < LogTailerPlus.Constants.LOG_LEVELS.length; x++ ){
            	var logLevel = LogTailerPlus.Constants.LOG_LEVELS[x];
                var regex = LogTailerPlus.getDefaultLogLevelRegex(logLevel);

            	if( logLevel && logLevel.length > 0){          
                    line = line.replace(regex, 
                       (match,$1,index) => {
							replaced++;
                        	return "<span class='"+logLevel.toLowerCase()+"'>"+$1+"</span>"
                    	});                   
                }                
        	}
            if( replaced == 0 ){
                if( line && line.length > 0){ 
                	if( emptyLines.length === 0){
                        var stackClass = LogTailerPlus.Constants.STACK_CLASS;
                        if( LogTailerPlus.Constants.DEFAULT_STACK_CLOSED ){
							stackClass += " "+LogTailerPlus.Constants.STACK_CLOSED_CLASS;
                        }
                		emptyLines.push("<span class='"+LogTailerPlus.Constants.STACK_CLASS+"'><span class='"+LogTailerPlus.Constants.STACK_ICON_CLASS+"'></span>");
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
    /* Determines delta content based on the current container and the string of new log messages */
    getDelta: ($logPanel, newContent) => {
		//if there is no content, new content is delta...
        var delta = newContent;

        var existingContent = $logPanel.children("."+LogTailerPlus.Constants.LOG_RESULT_CLASS).text();
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
                if( newContent.lastIndexOf(lastLine) >= 0 ){
	                delta = newContent.substr(newContent.lastIndexOf(lastLine)+lastLine.length);
                }
            }
        }
        return delta;
    },
    /* appends net new content to log result container*/
    appendLog: ($logResult,logContents) =>{
        //in case we need to do any other logic before appending, lets keep this separate.
        var appended = false;
        if( logContents && logContents.length > 0){
            $logResult.append(logContents);
            appended = true;
        }
         return appended;
    },
    /* Simple method to scroll the log window to either bottom or wherever was pinned */
    scrollLog: ($logPanel) => {
        var $logResult = $logPanel.children("."+LogTailerPlus.Constants.LOG_RESULT_CLASS);
        var scrollType = $logPanel.attr(LogTailerPlus.Constants.DATA_SCROLL);
        var scrollTo;
        if( scrollType === LogTailerPlus.Constants.SCROLL_PIN ){
            scrollTo = $logResult.scrollTop();
        }else if ( scrollType === LogTailerPlus.Constants.SCROLL_FOLLOW){
            scrollTo = $logResult.prop('scrollHeight');
        }
        if( scrollTo !== undefined ){
            $logResult.scrollTop(scrollTo);
        }
    },
    /**
        tailLog is will run the interval/update as well as initial population of logs
        (if refresh === 0 it will run only once)

    **/
    tailLog: ($logPanel) => {
        //this method handles polling the log.  Updated to promises for easier structure.
        var $logResult =  $logPanel.children("."+LogTailerPlus.Constants.LOG_RESULT_CLASS);
        var scrollType = $logPanel.attr(LogTailerPlus.Constants.DATA_SCROLL);

        LogTailerPlus.queryLog($logPanel)
            .then(logContents => { return LogTailerPlus.getDelta($logPanel,logContents)})
                .then(LogTailerPlus.formatResponse)
                    .then(formattedLog => { return LogTailerPlus.appendLog($logResult,formattedLog)})
                        .then( appended => {
                                if( appended ) setTimeout(() => { LogTailerPlus.scrollLog($logPanel)},100)
                        });
    },


    addLogPanel: (logName,refresh,grep,scroll) => {
        var hasExisting = $("."+LogTailerPlus.Constants.LOG_PANEL_CLASS+"["+LogTailerPlus.Constants.DATA_LOGGER+"='"+logName+"']").length;
        if( hasExisting === 0 ){ // no logs with this path have been added...
            var $logPanel =  $(LogTailerPlus.getHtmlTemplate(logName,refresh,grep,scroll));
            var $splitter = $(LogTailerPlus.getSplitterTemplate(logName));
            //$splitter not in document (yet) and wont be affected..
            $("."+LogTailerPlus.Constants.SPLITTER_CLASS).removeClass(LogTailerPlus.Constants.HIDDEN_CLASS);
            $("."+LogTailerPlus.Constants.PANEL_CONTAINER_CLASS).append($logPanel);
            $("."+LogTailerPlus.Constants.PANEL_CONTAINER_CLASS).append( $splitter);
            //if we want to use jquery-resize, set variable above...
        	if( LogTailerPlus.Constants.ENABLE_RESIZE === true ){
                var splitterSelector = "."+LogTailerPlus.Constants.SPLITTER_CLASS+"["+LogTailerPlus.Constants.DATA_LOGGER+"='"+logName+"']";
                var data = {}
					data[LogTailerPlus.Constants.RESIZER_HANDLE_SELECTOR] = splitterSelector;
					data[LogTailerPlus.Constants.RESIZER_RESIZE_HEIGHT] = false;
                $($logPanel).resizable(data);
            }
            //run once, then set interval if needed
            LogTailerPlus.tailLog($logPanel);
            if( refresh && refresh > 0 ){
	            setInterval( () => {
                	LogTailerPlus.tailLog($logPanel);
            	},refresh*1000);
            }
        }else{//that logs already there - why tail it twice!
			alert(logName + " is already being tailed.");
        }	
    },

    removeLogPanel: (button) => {
        var numPanels = $("."+LogTailerPlus.Constants.LOG_PANEL_CLASS).length;
        var $panel = $(button).parents('.'+LogTailerPlus.Constants.LOG_PANEL_CLASS);
        var logger = $panel.attr(LogTailerPlus.Constants.DATA_LOGGER);
		$panel.siblings("."+LogTailerPlus.Constants.SPLITTER_CLASS+"["+LogTailerPlus.Constants.DATA_LOGGER+"='"+logger+"']").first().remove();
        $panel.remove();
    }
};

jQuery(document).ready(LogTailerPlus.init);
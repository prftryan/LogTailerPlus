package logtailerplus.core.models;

import java.util.*;

import javax.inject.Inject;
import javax.annotation.PostConstruct;


import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.commons.osgi.PropertiesUtil;
import org.apache.sling.api.SlingHttpServletRequest;

import org.osgi.framework.BundleContext;
import org.osgi.framework.FrameworkUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.cm.Configuration;

/**
 * This class can be used as Use in slightly script for getting remote dam configurations.
 */
@Model(
        adaptables=SlingHttpServletRequest.class,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class LogTailerPlus {
    private static final Logger log = LoggerFactory.getLogger(LogTailerPlus.class);
    private static final String LOGGER_FACTORY_PID = "org.apache.sling.commons.log.LogManager.factory.config";
    private static final String LOGGER_NAME = "org.apache.sling.commons.log.file";
    private static final String LOG_CONFIG_FILTER = '(' + ConfigurationAdmin.SERVICE_FACTORYPID + '=' + LOGGER_FACTORY_PID + ')';

    private List<String> logNames;
    private String slingHome;


    @Inject
    ConfigurationAdmin configAdmin;

    public List getLogNames() throws Exception{
        return logNames;
    }

    public String getSlingHome() {
        return slingHome;
    }

    @PostConstruct
    private void init(){
        try {
            BundleContext bundleContext = FrameworkUtil.getBundle(LogTailerPlus.class).getBundleContext();
            Configuration[] allLoggerConfigs = configAdmin.listConfigurations(LOG_CONFIG_FILTER);
            logNames = new ArrayList<>();
            slingHome = bundleContext.getProperty("sling.home");
            for (Configuration config:allLoggerConfigs){
                String logName = PropertiesUtil.toString(config.getProperties().get(LOGGER_NAME),null);
                if( logName != null && logName.length() > 0){
                    logNames.add(logName);
                }
            }
        } catch (Exception e) {
            // TODO Auto-generated catch block
            log.error("Found Exception:",e);
        }

    }


}


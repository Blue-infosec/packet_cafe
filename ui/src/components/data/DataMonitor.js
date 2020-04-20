import { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'

import { stopFetchResults } from "epics/auto-fetch-results-epic"
import { fetchToolStatus } from 'epics/fetch-status-epic'
import { fetchToolResults } from 'epics/fetch-tool-results-epic'

const DataMonitor = (props) => {
    const dispatch = useDispatch();
    const toolResults = useSelector(state => state.data.toolResults) || {};

    const getCompleted = (statuses, fileResults) => {
        var completed = [];
        for (const tool in statuses ){
            if(statuses[tool].status === "Complete" && !fileResults[tool]){
                completed.push(tool);
            }
        }

        return completed;
    }

    useEffect(() => {
        for(const file of props.files){
            const payload = {
                'sessionId': props.sessionId, 
                'fileId':file.id,
            }

            const action$ = { 'type': fetchToolStatus.toString(), 'payload': payload };
            dispatch(action$);
        }
    }, [props.files]);

    useEffect(() => {
        if(props.files && props.statuses)
        for(const file of props.files){
            const fileResults = toolResults[file.id] || {};
            const completed = getCompleted(props.statuses[file.id], fileResults);
            for(const tool of completed){
                const payload = {
                    'sessionId': props.sessionId, 
                    'fileId':file.id,
                    'tool': tool,
                    'counter':0,
                }
                const action$ = fetchToolResults(payload);
                dispatch(action$);
            }

            if(props.statuses[file.id] && completed.length === Object.keys(props.statuses[file.id]).length){
                const action$ = { 'type': stopFetchResults.toString() };
                dispatch(action$);
            }
        }
    }, [props.files, props.statuses]);

    return null;
}

export default DataMonitor
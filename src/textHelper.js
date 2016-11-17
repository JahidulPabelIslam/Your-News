/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
        http://aws.amazon.com/apache2.0/
    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';

var textHelper = (function () {
    
    return {
        
        completeHelp: 'Here\'s some things you can say,'
        + ' add chelsea fc.'
        + ' delete chelsea fc.'
        + ' score for my teams.'
        + ' score for chelsea fc.'
        + ' latest news for my teams.'
        + ' latest news for chelsea fc.'
        + ' next fixture for my teams.'
        + ' next fixtures for chelsea fc.'
        + ' reset my teams.'
        + ' repeat.'
        + ' and exit.',

        nextHelp: 'You can add a team, delete a team, get the score for your team\'s or a team, get the latest news for your team\'s or a team, get the next fixture for your team\'s or a team, or say help. What would you like?'
        
    };

})();
module.exports = textHelper;
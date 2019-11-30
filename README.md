# rsysSegBuild.js
Builds a segmentation dashboard in Responsys Interact.
Last tested on Firefox to be working May 2019.

Inspired by Justin Hilborn's segmentation dashboard bookmarklet.

## Getting started
1. Edit lines 2 - 8 of this script for your campaign.
2. Go to Responsys Interact's navigation sidebar -> Data -> Manage Lists -> Create or edit a segmentation dashboard -> Segments -> Rules.
3. Open up the browser's web console (CTRL + Shift + K on Firefox).
4. Run this script by copying and pasting this whole script into the web console.
5. Check to see if the rules were added correctly.
6. IDEA for maxRules usage
    1. Create an array that will have the length of the fields in use pushed into it.
    2. Use the reduce method to multiply each element within the array to get the total amount of rules.
    3. If total amount of rules is greater than maxRules, do not continue and return error message.

- If there was an error, type the "frame.setAttribute("onload", "");" command into the console. It would be best to navigate away from the page to clean up the variables.
- Set abort to 1 or type in "Segmentation.abort();" into the console to stop the script.

## TODO
1. Move variables into an object
2. Account for the maximum rules allowed (100)
3. Use fewer hardcoded values
4. Improve clarity
5. Implement a cleaner abort
6. Implement support for more than 3 fields

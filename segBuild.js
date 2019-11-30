/*
NAME
  segBuild.js - Clunky implementation of automating building a segmentation dashboard in Responsys Interact using a combination of two fields.

DESCRIPTION
  RI Segmentation Dashboard Builder Script
  Heavily inspired by Justin Hilborn's original segmentation dashboard bookmarklet.
  Potential future updates: Account for the maximum rules allowed (100), move variables into an object, use fewer hardcoded values, improve clarity, implement a cleaner abort, support for more than 3 fields.
  Last updated: 5/23/19

INSTRUCTIONS
  1. Edit lines 23 - 29 of this script for your campaign.
  2. Go to Responsys Interact's navigation sidebar -> Data -> Manage Lists -> Create or edit a segmentation dashboard -> Segments -> Rules.
  3. Open up the browser's web console (CTRL + Shift + K on Firefox).
  4. Run this script by copying and pasting this whole script into the web console.
  5. Check to see if the rules were added correctly.

  - If there was an error, type the "frame.setAttribute("onload", "");" command into the console. It would be best to navigate away from the page to clean up the variables.
  - Set abort to 1 or type in "Segmentation.abort();" into the console to stop the script.
*/

// Assign values specific to the campaign here.
var field0 = 'PERSONA_NBR';  // The actual column/field names, case-sensitive
var field1 = 'MAILER_VERSION_ID';
var field2 = '';
var field0ValuesArray = ['1', '2'];
var field1ValuesArray = ['1', '2', '6', '7', '8', '13', '14', '15', '18', '19', '20', '22', '27', '29'];
var field2ValuesArray = [];
var field0Abbrev = 'P', field1Abbrev = 'MV', field2Abbrev = '';  // Optional. Used for the rule names; for example: P1MV2


/* |||||||||||||||||||||||||||||||||||||||| *\
  Only modify below this line if necessary.
\* |||||||||||||||||||||||||||||||||||||||| */

// Declare additional global variables.
var maxRules = 100;  // TODO: Actually use this somewhere, currently does nothing.
/*
  IDEA for maxRules usage
    1. Create an array that will have the length of the fields in use pushed into it.
    2. Use the reduce method to multiply each element within the array to get the total amount of rules.
    3. If total amount of rules is greater than maxRules, do not continue and return error message.
*/
// Another IDEA: Move most of the global variables into an object. Or just use a regular class and not a class with static methods.
var field0ValuesArrayLen, field1ValuesArrayLen, field2ValuesArrayLen;
var fieldsCounter = 0;
var i, j, k;
var abort = 0;

// Save working iframe in easy-to-access variables.
var frame = document.getElementById("main2").contentDocument.getElementsByTagName("iframe")[0];
var frameDoc = frame.contentDocument;

// Had to assign the class to a var or else the class wouldn't be in the global namespace.
var Segmentation = class
{
  static start()
  {
    console.log("Starting...");
    abort = 0;

    // Define the frame and frameDoc variables again within the function scope just in case.
    let frame = document.getElementById("main2").contentDocument.getElementsByTagName("iframe")[0];
    let frameDoc = frame.contentDocument;

    // Check if field is being used.
    // TODO: Could definitely revamp the ifs below here to be more elegant in the future.
    if (Array.isArray(field0ValuesArray) && field0ValuesArray.length !== 0 && typeof field0 === "string" && field0.length !== 0)
    {
      // Initialize loop variable.
      i = 0;
      // Set length in a variable for easier reference later.
      field0ValuesArrayLen = field0ValuesArray.length;
    }
    else
    {
      console.log("ERROR: Please fill out the values for field0 in the script.");
    }

    if (Array.isArray(field1ValuesArray) && field1ValuesArray.length !== 0 && typeof field1 === "string" && field1.length !== 0)
    {
      j = 0;
      field1ValuesArrayLen = field1ValuesArray.length;
      // Add 1 to the fieldsCounter for later use.
      ++fieldsCounter;  // Be careful when using ++ and --, stick to the long form for expressions.
      console.log("Found field1 in use.");
    }

    if (Array.isArray(field2ValuesArray) && field2ValuesArray.length !== 0 && typeof field2 === "string" && field2.length !== 0)
    {
      k = 0;
      field2ValuesArrayLen = field2ValuesArray.length;
      ++fieldsCounter;
      console.log("Found field2 in use.");
    }

    // The first field (field0) must be used. i, j, and k are only initalized as numbers once the field values are detected above.
    if (typeof i === "number" && typeof j === "undefined" && typeof k === "number")
    {
      console.log("ERROR: Please don't fill out field2 without filling out field1.");
    }
    else if  // one of these conditions are true... (JavaScript logical ANDs have higher precedence than logical ORs.)
    (
      typeof i === "number" && typeof j === "undefined" && typeof k === "undefined" ||
      typeof i === "number" && typeof j === "number"
    )
    {
      // console.log(`DEBUG\ntypeof i: "${typeof i}"\ntypeof j: "${typeof j}"\ntypeof k: "${typeof k}"`);
      this.addSegmentRule();  // The "this" refers back to the class containing this method.
    }
  }


  static addSegmentRule()
  {
    // Check on abort flag. If set to 1, begin abort process.
    if (abort === 1)
    {
      this.aborting();
    }
    else
    {
      console.log("Adding segmentation rule...");

      let frame = document.getElementById("main2").contentDocument.getElementsByTagName("iframe")[0];
      let frameDoc = frame.contentDocument;

      // The querySelectorAll method will return a NodeList, an array-like object. The double escape with backslashes is necessary.
      let addSegmentRuleLinks = frameDoc.querySelectorAll("a[href='javascript:submitRule(\\'\\', \\'addRule\\')']");
      let addSegmentRule;
      // Go through each anchor tag in the NodeList and find the first one that says "Add Segment Rule".
      console.log("Searching for the 'Add Segment Rule' link...");
      for (let index = 0, addSegmentRuleLinksLen = addSegmentRuleLinks.length; index < addSegmentRuleLinksLen; ++index)
      {
        if (addSegmentRuleLinks[index].innerHTML === "Add Segment Rule")
        {
          addSegmentRule = addSegmentRuleLinks[index];
          break;
        }
      }
      if (addSegmentRule === undefined)
      {
        console.log("The 'Add Segment Rule' link couldn't be found!");
      }

      // Set a function/method to run when the page reloads.
      let onloadValue;
      if (fieldsCounter !== 0)
      {
        // Set the method to addField if more than one expected field.
        onloadValue = "window.top.Segmentation.addField(" + fieldsCounter.toString() + ", 0);";
      }
      else
      {
        // Skip adding fields and set the method to fillRuleDetails if only field0 is being used.
        onloadValue = "window.top.Segmentation.fillRuleDetails();";
      }
      frame.setAttribute("onload", onloadValue);

      addSegmentRule.click();  // Click on the Add Segment Rule link.
      addSegmentRule = undefined;  // Reset addSegmentRule to undefined for the next time.
    }
  }


  static addField(fieldsCounterCopy, addFieldInternalCounter)  // fieldsCounter is global, fieldsCounterCopy is local.
  {
    if (abort === 1)
    {
      this.aborting();
    }
    else
    {
      console.log("Adding an additional clause...");

      // Probably necessary to redefine the frame and frameDoc variables after the iframe reloads.
      let frame = document.getElementById("main2").contentDocument.getElementsByTagName("iframe")[0];
      let frameDoc = frame.contentDocument;

      // Choose the "AND" option value.
      let query = "select[name='WhereCombineOp" + addFieldInternalCounter.toString() + "'][id='WhereCombineOp" + addFieldInternalCounter.toString() + "']";
      let addField = frameDoc.querySelectorAll(query);
      addField[0].value = "AND";

      ++addFieldInternalCounter;
      --fieldsCounterCopy;

      let onloadValue;
      if (fieldsCounterCopy === 0)  // If no additional fields need to be added, set to continue to fillRuleDetails.
      {
        onloadValue = "window.top.Segmentation.fillRuleDetails();";
      }
      else  // Re-run this method if another field needs to be added.
      {
        onloadValue = "window.top.Segmentation.addField(" + fieldsCounterCopy.toString() + ", " + addFieldInternalCounter.toString() + ");";
      }
      frame.setAttribute("onload", onloadValue);

      frameDoc.getElementById("theForm").submit();
    }
  }


  static fillRuleDetails()
  {
    if (abort === 1)
    {
      this.aborting();
    }
    else
    {
      console.log("Filling out the rule details...");

      let frame = document.getElementById("main2").contentDocument.getElementsByTagName("iframe")[0];
      let frameDoc = frame.contentDocument;

      let ruleName, ruleNameValue;
      let field0DropDown, field0Input, field1DropDown, field1Input, field2DropDown, field2Input;  // Is it drop-down, dropdown, or drop down? Hmm.

      // field0 is always going to be used.
      ruleName = frameDoc.querySelectorAll("input[name='RuleDisplayName'][class='ruletext']");
      field0DropDown = frameDoc.querySelectorAll("select[name='WhereField0'][id='WhereField0']");
      field0Input = frameDoc.querySelectorAll("input[name='WhereValue0'][id='WhereValue0']");
      field0DropDown[0].value = field0;
      field0Input[0].value = field0ValuesArray[i];
      ruleNameValue = field0Abbrev + field0ValuesArray[i];

      // If fieldsCounter is at least 1...
      if (fieldsCounter >= 1)
      {
        field1DropDown = frameDoc.querySelectorAll("select[name='WhereField1'][id='WhereField1']");
        field1Input = frameDoc.querySelectorAll("input[name='WhereValue1'][id='WhereValue1']");
        field1DropDown[0].value = field1;
        field1Input[0].value = field1ValuesArray[j];
        ruleNameValue = field0Abbrev + field0ValuesArray[i] + field1Abbrev + field1ValuesArray[j];
      }

      if (fieldsCounter === 2)
      {
        field2DropDown = frameDoc.querySelectorAll("select[name='WhereField2'][id='WhereField2']");
        field2Input = frameDoc.querySelectorAll("input[name='WhereValue2'][id='WhereValue2']");
        field2DropDown[0].value = field2;
        field2Input[0].value = field2ValuesArray[k];
        ruleNameValue = field0Abbrev + field0ValuesArray[i] + field1Abbrev + field1ValuesArray[j] + field2Abbrev + field2ValuesArray[k];
      }

      ruleName[0].value = ruleNameValue;

      this.loopBack();
    }
  }


  static loopBack()
  {
    if (abort === 1)
    {
      this.aborting();
    }
    else
    {
      console.log("Incrementing the array index...");

      // Exploits fallthrough behavior.
      switch (fieldsCounter)
      {
        case 2:
          ++k;
          if (k === field2ValuesArrayLen)
          {
            k = 0;
            ++j;
          }
        case 1:
          if (fieldsCounter === 1)  // The if is to ensure the number k doesn't get incremented twice.
          {
            ++j;
          }
          if (j === field1ValuesArrayLen)
          {
            j = 0;
            ++i;
          }
        default:
          if (fieldsCounter === 0)
          {
            ++i;
          }
          if (i < field0ValuesArrayLen)
          {
            this.addSegmentRule();
          }
          else  // No more loops necessary.
          {
            i = undefined;
            j = undefined;
            k = undefined;
            fieldsCounter = 0;
            frame.setAttribute("onload", "");
            console.log("All the rules have been added.");
          }
          break;
      }
    }
  }


  static abort()
  {
    abort = 1;
    console.log("Attempting to abort...");
  }

  static aborting()
  {
    // Attempt to reset variables.
    i = undefined;
    j = undefined;
    k = undefined;
    fieldsCounter = 0;
    frame.setAttribute("onload", "");
    console.log("Execution of the segmentation script has been stopped.")
    abort = 0;
  }
}


Segmentation.start();  // This starts the whole thing.

/* rsysSegBuild.js
 * Last updated 12/1/19
 */

// Assign values specific to the campaign here.
var config = {
  fields: [
    {
      name: "EMAIL_ISP_",  // The actual column/field names, case-sensitive
      abbreviation: "ISP-",  // Used for the rule names
      values: ["AOL", "Gmail", "Hotmail", "Yahoo", "Other"]
    },
    {
      name: "STATE_",
      abbreviation: "__STATE-",
      values: [
        "AL", "AR", "CA", 1, 2, 3, 4, 5, 6, 7, 8, 9, 0
      ]
    },
    {
      name: "CITY_",
      abbreviation: "__CITY-",  // Example: ISP-AOL__STATE-AL__CITY-Franklin
      values: [
        "Franklin", 1, 2, 3, 4, 5, 6, 7, 8, 9, 0
      ]
    }
  ],
  // Don't edit below here unless necessary.
  maximumRules: 100,
  targetFrameStr: "document.getElementById('main2').contentDocument" +
    ".getElementsByTagName('iframe')[0]"
};


// Assign the class to a var, else the class won't be in the global namespace.
var SegmentationBuilder = class
{
  constructor(config)
  {
    this._config = this._ingestConfig(config);
  }

  // Public
  abort()
  {
    this._config.abort = true;
    console.log("Attempting to abort...");
  }

  start(check=true, config=undefined)
  {
    if (config)
    {
      this._config = this._ingestConfig(config)
    }
    if (check && this._checkMaximumRules === "ok")
    {
      console.log("Starting...");

      this._config.abort = false;
      this._addSegmentRule();
    }
    else
    {
      this._aborting();
    }
  }

  forceStart(config=undefined)
  {
    this.start(check=false, config=config);
  }

  deleteFirstRule()
  {
    // TODO: Suppress confirmation box.
    // Check on abort flag. If set to true, begin abort process.
    if (this._config.abort === true)
    {
      this._aborting();
    }
    else
    {
      console.log("Deleting the first segmentation rule...");

      let targetFrame = this._getTargetFrame(this._config.targetFrameStr);
      let targetFrameDoc = targetFrame.contentDocument;

      let deleteSegmentRuleLinks = targetFrameDoc.querySelectorAll(
        `a[href^="javascript:submitRule('rule"][href$="', 'delete')"]`
      );
      let deleteSegmentRule;
      // console.log("Searching for the \"Delete\" link...");
      for (
        let i = 0, deleteSegmentRuleLinksLen = deleteSegmentRuleLinks.length;
        i < deleteSegmentRuleLinksLen;
        ++i
      )
      {
        if (deleteSegmentRuleLinks[i].innerHTML === "Delete")
        {
          deleteSegmentRule = deleteSegmentRuleLinks[i];
          break;
        }
      }
      if (deleteSegmentRule === undefined)
      {
        console.log("The \"Delete\" link couldn't be found!");
      }

      deleteSegmentRule.click();  // Click on the Add Segment Rule link.
    }
  }

  // Private
  _addSegmentRule()
  {
    if (this._config.abort === true)
    {
      this._aborting();
    }
    else
    {
      console.log("Adding segmentation rule...");

      let targetFrame = this._getTargetFrame(this._config.targetFrameStr);
      let targetFrameDoc = targetFrame.contentDocument;

      // Escape the backslashes which will escape the single quotes.
      let addSegmentRuleLinks = targetFrameDoc.querySelectorAll(
        "a[href='javascript:submitRule(\\'\\', \\'addRule\\')']"
      );
      let addSegmentRule;
      // console.log("Searching for the \"Add Segment Rule\" link...");
      for (
        let i = 0, addSegmentRuleLinksLen = addSegmentRuleLinks.length;
        i < addSegmentRuleLinksLen;
        ++i
      )
      {
        if (addSegmentRuleLinks[i].innerHTML === "Add Segment Rule")
        {
          addSegmentRule = addSegmentRuleLinks[i];
          break;
        }
      }
      if (addSegmentRule === undefined)
      {
        console.log("The \"Add Segment Rule\" link couldn't be found!");
      }

      // Set a function to run when the page reloads.
      let onloadValue;
      if (this._config.fieldsLength > 1)
      {
        // Set the method to _addField if more than one expected field.
        onloadValue = `window.top.${this._getInstanceName()}._addField(` +
          `${(this._config.fieldsLength-1).toString()}, 0);`;
      }
      else
      {
        // Skip adding fields if only one field is being used.
        onloadValue =
          `window.top.${this._getInstanceName()}.fillRuleDetails();`;
      }
      targetFrame.setAttribute("onload", onloadValue);

      addSegmentRule.click();  // Click on the Add Segment Rule link.
    }
  }

  _addField(fieldsLeftToAdd, WhereCombineOpCounter)
  {
    if (this._config.abort === true)
    {
      this._aborting();
    }
    else
    {
      console.log("Adding an additional clause...");

      let targetFrame = this._getTargetFrame(this._config.targetFrameStr);
      let targetFrameDoc = targetFrame.contentDocument;

      // Choose the "AND" option value.
      let cssSelector =
        `select[name='WhereCombineOp${WhereCombineOpCounter.toString()}']` +
        `[id='WhereCombineOp${WhereCombineOpCounter.toString()}']`;
      let addField = targetFrameDoc.querySelectorAll(cssSelector);
      addField[0].value = "AND";

      ++WhereCombineOpCounter;
      --fieldsLeftToAdd;

      let onloadValue;
      // If no additional fields are needed, continue onto the next part.
      if (fieldsLeftToAdd === 0)
      {
        onloadValue =
          `window.top.${this._getInstanceName()}._fillRuleDetails();`;
      }
      else  // Re-run this method if other fields need to be added.
      {
        onloadValue =
          `window.top.${this._getInstanceName()}._addField(` +
            `${fieldsLeftToAdd.toString()},` +
            `${WhereCombineOpCounter.toString()}` +
          `);`;
      }
      targetFrame.setAttribute("onload", onloadValue);

      targetFrameDoc.getElementById("theForm").submit();
    }
  }

  _fillRuleDetails()
  {
    if (this._config.abort === true)
    {
      this._aborting();
    }
    else
    {
      console.log("Filling out the rule details...");

      let targetFrame = this._getTargetFrame(this._config.targetFrameStr);
      let targetFrameDoc = targetFrame.contentDocument;

      let ruleName = targetFrameDoc.querySelectorAll(
        "input[name='RuleDisplayName'][class='ruletext']");
      let ruleNameValue = "";

      for (
        let i = 0,
          dropDown, input, currentValue, currentValuesIndex, abbreviation;
        i < this._config.fieldsLength;
        ++i
      )
      {
        dropDown = targetFrameDoc.querySelectorAll(
          `select[name='WhereField${i}'][id='WhereField${i}']`);
        dropDown[0].value = this._config.fields[i].name;
        input = targetFrameDoc.querySelectorAll(
          `input[name='WhereValue${i}'][id='WhereValue${i}']`);
        currentValuesIndex = this._config.fields[i].currentValuesIndex;
        currentValue = this._config.fields[i].values[currentValuesIndex];
        input[0].value = currentValue;
        abbreviation = this._config.fields[i].abbreviation;
        ruleNameValue += abbreviation + currentValue;
      }
      ruleName[0].value = ruleNameValue;

      this._getNextValues();
    }
  }

  _getNextValues()
  {
    if (this._config.abort === true)
    {
      this._aborting();
    }
    else
    {
      console.log("Getting the next field values...");
      let is_finished = this._incrementValuesIndex();
      if (is_finished === false)
      {
        this._addSegmentRule();
      }
      else
      {
        this._aborting();
      }
    }
  }

  _incrementValuesIndex(nthLastIndex=1)
  // Recursive
  {
    if (this._config.abort === true)
    {
      this._aborting();
    }
    else
    {
      let field = this._config.fields[this._config.fieldsLength-nthLastIndex];
      console.log(`Getting the next ${field.name} value...`);
      ++field.currentValuesIndex;
      let is_finished = false;
      // If the field's currentValuesIndex is out of bounds...
      if (field.currentValuesIndex > field.valuesLength-1)
      {
        // And if not at the last index of each field...
        if (nthLastIndex !== this._config.fieldsLength)
        {
          field.currentValuesIndex = 0;
          is_finished = this._incrementValuesIndex(nthLastIndex+1);
        }
        else
        {
          console.log("All the rules have been added.");
          is_finished = true;
        }
      }
      return is_finished;
    }
  }

  _ingestConfig(config)
  {
    console.log("Ingesting config...")
    let updatedConfig = {
      fields: config.fields,
      fieldsLength: config.fields.length,
      maximumRules: config.maximumRules,
      targetFrameStr: config.targetFrameStr,
      abort: false
    };
    for (let i = 0; i < updatedConfig.fieldsLength; ++i)
    {
      updatedConfig.fields[i].valuesLength =
        updatedConfig.fields[i].values.length;
      updatedConfig.fields[i].currentValuesIndex = 0;
    }
    return updatedConfig;
  }

  _checkMaximumRules()
  {
    let currentAmountOfRules = () => {
      let amount = this._config.fields[0].valuesLength;
      for (let i = 1; i < this._config.fieldsLength; ++i)
      {
        amount *= this._config.fields[i].valuesLength;
      }
      return amount;
    };
    if (currentAmountOfRules > this._config.maximumRules)
    {
      console.log(
        `WARNING: Current configuration exceeds maximum rules allowed` +
        `(${this._config.maximumRules}).`
      )
      return "no está bien";
    }
    else
    {
      return "ok";
    }
  }

  _aborting()
  {
    // Reset currentValuesIndex positions.
    for (let i = 0; i < this._config.fieldsLength; ++i)
    {
      this._config.fields[i].currentValuesIndex = 0;
    }
    let targetFrame = this._getTargetFrame(this._config.targetFrameStr);
    targetFrame.setAttribute("onload", "");
    console.log("Execution of the segmentation script has been stopped.")
    this._config.abort = false;
  }

  _getTargetFrame(targetFrameStr)
  {
    return Function(`"use strict"; return ${targetFrameStr}`)();
  }

  _getInstanceName()
  {
    // Search through the global object for a name that resolves to this
    // object.
    for (var name in window)
      if (window[name] == this)
      {
        return name;
      }
  }
}

var currentDashboardBuild = new SegmentationBuilder(config);
currentDashboardBuild.start();

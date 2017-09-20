{
  "configurationSettings": [{
    "category": "General",
    "fields": [{
      "type": "webmap",
      "conditions": ["featurelayer"]
    }, {
      "type": "appproxies"
    }, {
      "placeHolder": "Defaults to web map title",
      "label": "Application Title",
      "fieldName": "title",
      "type": "string",
      "tooltip": "Defaults to web map title"
    }, {
      "type": "string",
      "fieldName": "description",
      "label": "Details",
      "placeHolder": "Defaults to web map description.",
      "tooltip": "Enter content for the details panel",
      "stringFieldOption": "richtext"
    }]
  }, {
    "category": "Theme",
    "fields": [{
      "type": "subcategory",
      "label": "Colors"
    }, {
      "type": "color",
      "fieldName": "headercolor",
      "tooltip": "Title text color",
      "label": "Title text color",
      "sharedThemeProperty": "header.text"
    }, {
      "type": "color",
      "fieldName": "headerbackground",
      "tooltip": "Title background color",
      "label": "Title background color",
      "sharedThemeProperty": "header.background"
    }, {
      "type": "color",
      "fieldName": "bgcolor",
      "tooltip": "Panel background color",
      "label": "Background color",
      "sharedThemeProperty": "body.background"
    }, {
      "type": "color",
      "tooltip": "Panel text color",
      "label": "Text color",
      "fieldName": "textcolor",
      "sharedThemeProperty": "body.text"
    }, {
      "type": "color",
      "fieldName": "navcolor",
      "tooltip": "Feature navigation arrow and bullet color",
      "label": "Navigation arrow and bullet color"
    }, {
      "type": "color",
      "fieldName": "buttoncolor",
      "label": "Button color",
      "tooltip": "Button color",
      "sharedThemeProperty": "button.background"
    }, {
      "type": "color",
      "fieldName": "buttontextcolor",
      "label": "Button text color",
      "sharedThemeProperty": "button.text"
    }, {
      "type": "color",
      "fieldName": "symbolcolor",
      "label": "Selection symbol color"
    }, {
      "type": "paragraph",
      "value": "Use the Custom css option to add css that overwrites rules in the app."
    }, {
      "type": "string",
      "fieldName": "customstyle",
      "tooltip": "Custom css",
      "label": "Custom css"
    }]
  }, {
    "category": "Options",
    "fields": [{
      "placeHolder": "Defaults to Start here",
      "label": "Button text",
      "fieldName": "buttontext",
      "type": "string"
    }, {
      "type": "boolean",
      "fieldName": "legend",
      "label": "Show legend"
    }, {
      "type": "boolean",
      "fieldName": "socialshare",
      "label": "Include Facebook, Twitter, Email sharing"
    }, {
      "type": "boolean",
      "fieldName": "overview",
      "label": "Add Overview map"
    }]
  }, {
    "category": "Ranking",
    "fields": [{
      "type": "paragraph",
      "value": "In order to rank features for display the specified feature service must support the supportsOrderBy property which is available if the service is version 10.1 or greater. "
    }, {
      "type": "layerAndFieldSelector",
      "fieldName": "layerInfo",
      "label": "Ranking layer",
      "fields": [{
        "multipleSelection": false,
        "fieldName": "layerField",
        "label": "Ranking field"
      }],
      "layerOptions": {
        "supportedTypes": ["FeatureLayer", "FeatureCollection"],
        "geometryTypes": ["esriGeometryPoint", "esriGeometryLine", "esriGeometryPolyline", "esriGeometryPolygon", "esriGeometryMultipoint"]
      }
    }, {
      "type": "number",
      "fieldName": "count",
      "label": "Number of features to display",
      "placeHolder": "Default vaue is 10"
    }, {
      "type": "options",
      "fieldName": "order",
      "label": "Rank Order",
      "options": [{
        "label": "Low to High",
        "value": "ASC"
      }, {
        "label": "High to Low",
        "value": "DESC"
      }]
    }, {
      "type": "conditional",
      "condition": false,
      "fieldName": "autoplay",
      "label": "Enable auto play",
      "items": [{
        "type": "string",
        "fieldName": "autoplayspeed",
        "placeholder": "5000 milliseconds",
        "label": "Auto play speed (in millseconds)"
      }]
    }, {
      "type": "options",
      "fieldName": "pagingType",
      "label": "Bullet Display Type",
      "options": [{
        "label": "Bullets",
        "value": "Bullets"
      }, {
        "label": "Label",
        "value": "Label"
      }, {
        "label": "Bullets And Labels",
        "value": "BulletsAndLabel"
      }, {
        "label": "Progress",
        "value": "progress"
      }, {
        "label": "Slider",
        "value": "slider"
      }]
    }, {
      "type": "paragraph",
      "value": "Display text listing the rank # of the selected feature. Define custom text to wrap around the current rank and total. <br><br> To display the current number and total number, the custom text should include both {current} and {total}.  Here is an example:  This feature is ranked {current} of {total}"
    }, {
      "type": "string",
      "fieldName": "rankLabelTemplate",
      "label": "Custom text to display in paging area",
      "placeHolder": "{current} of {total}"
    }, {
      "type": "paragraph",
      "value": "By default the app will zoom to the extent of the selected features. If you'd like to modify the zoom level specify a new zoom level value here."
    }, {
      "type": "scalelist",
      "fieldName": "selectionZoomScale",
      "label": "Custom zoom scale"
    }]
  }],
  "values": {
    "autoplay": false,
    "socialshare": false,
    "legend": true,
    "overview": false,
    "order": "DESC",
    "count": 10,
    "symbolcolor": "#00ffff",
    "navcolor": "#fff",
    "headercolor": "#5d5d5d",
    "headerbackground": "#ffffff",
    "bgcolor": "#ffffff",
    "textcolor": "#5d5d5d",
    "buttoncolor": "#4DBD33",
    "buttontextcolor": "#fff",
    "pagingType": "Label"
  }
}
/*global define,document */
/*jslint sloppy:true,nomen:true */
/*
 | Copyright 2014 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/array",
  "dojo/_base/kernel",

  "dojo/parser",
  "dojo/Deferred",
  "dojo/query",
  "dojo/on",

  "dojo/dom",
  "dojo/dom-attr",
  "dojo/dom-class",
  "dojo/dom-construct",
  "dojo/dom-style",

  "dijit/layout/ContentPane",
  "dijit/registry",

  "esri/arcgis/utils",
  "esri/tasks/query",
  "esri/graphic",
  "esri/Color",
  "esri/lang",

  "esri/layers/FeatureLayer",
  "esri/layers/GraphicsLayer",
  "esri/graphicsUtils",

  "esri/dijit/HomeButton",

  "application/MapUrlParams",

  "dojo/domReady!"
], function (
  declare, lang,
  array,
  kernel,
  parser,
  Deferred,
  domQuery, on,
  dom, domAttr, domClass, domConstruct, domStyle,
  ContentPane,
  registry,
  arcgisUtils,
  Query, Graphic, Color, esriLang,
  FeatureLayer,
  GraphicsLayer,
  graphicsUtils,
  HomeButton,
  MapUrlParams
) {
  return declare(null, {
    config: {},
    numSlides: 0,
    featureSwipe: null,
    startup: function (config) {
      parser.parse();
      document.documentElement.lang = kernel.locale;
      // config will contain application and user defined info for the template such as i18n strings, the web map id
      // and application id
      // any url parameters and any application specific configuration information.
      if (config) {
        this.config = config;
        //supply either the webmap id or, if available, the item info
        var itemInfo = this.config.itemInfo || this.config.webmap;
        if (this.config.sharedThemeConfig && this.config.sharedThemeConfig.attributes && this.config.sharedThemeConfig.attributes.theme) {
          var sharedTheme = this.config.sharedThemeConfig.attributes;
          this.config.logo = sharedTheme.layout.header.component.settings.logoUrl || sharedTheme.theme.logo.small || null;
          this.config.color = sharedTheme.theme.text.color;
          this.config.theme = sharedTheme.theme.body.bg;
        }
        // Create and add custom style sheet
        if (this.config.customstyle) {
          var style = document.createElement("style");
          style.appendChild(document.createTextNode(this.config.customstyle));
          document.head.appendChild(style);
        }

        this._updateColorScheme();
        this._addLocalizedText();

        // Check for center, extent, level and marker url parameters.
        var mapParams = new MapUrlParams({
          center: this.config.center || null,
          extent: this.config.extent || null,
          level: this.config.level || null,
          marker: this.config.marker || null,
          mapSpatialReference: itemInfo.itemData.spatialReference,
          defaultMarkerSymbol: this.config.markerSymbol,
          defaultMarkerSymbolWidth: this.config.markerSymbolWidth,
          defaultMarkerSymbolHeight: this.config.markerSymbolHeight,
          geometryService: this.config.helperServices.geometry.url
        });

        mapParams.processUrlParams().then(lang.hitch(this, function (urlParams) {
          this._createWebMap(itemInfo, urlParams);
        }), lang.hitch(this, function (error) {
          this.reportError(error);
        }));

      } else {
        var error = new Error("Main:: Config is not defined");
        this.reportError(error);
        var def = new Deferred();
        def.reject(error);
      }
    },
    reportError: function (error) {
      // remove loading class from body
      domClass.remove(document.body, "app-loading");
      domClass.add(document.body, "app-error");
      var node = dom.byId("loading_message");
      if (node) {
        node.innerHTML = error;
      }
      return error;
    },
    _addLocalizedText: function () {
      dom.byId("closeInfo").innerHTML = this.config.buttontext || "Start here"; // this.config.i18n.closebutton.label;

      dom.byId("next").value = this.config.i18n.navigation.nextLabel;
      dom.byId("prev").value = this.config.i18n.navigation.previousLabel;
      dom.byId("next").title = this.config.i18n.navigation.nextLabel;
      dom.byId("prev").title = this.config.i18n.navigation.previousLabel;

      domAttr.set("facebookShare", {
        "title": this.config.i18n.toolbar.facebookShare,
        "aria-label": this.config.i18n.toolbar.facebookShare
      });

      domAttr.set("twitterShare", {
        "title": this.config.i18n.toolbar.twitterShare,
        "aria-label": this.config.i18n.toolbar.twitterShare
      });
      domAttr.set("linkShare", {
        "title": this.config.i18n.toolbar.linkShare,
        "aria-label": this.config.i18n.toolbar.linkShare
      });

    },
    _updateColorScheme: function () {
      // Update app to use color scheme defined in config
      domQuery(".navcolor").style("color", this.config.navcolor);
      domQuery(".closeNav").style("background-color", this.config.bgcolor);
      domQuery(".nav-btn").style("color", this.config.textcolor);
      domStyle.set(dom.byId("sidebar"), "background-color", this.config.bgcolor);
      domQuery(".fgcolor").style("color", this.config.textcolor);

      domQuery(".title-row").style("color", this.config.headercolor);
      domQuery(".title-row").style("background-color", this.config.headerbackground);
      domQuery(".share-btn").style("color", this.config.headercolor);
      domQuery(".info-btn").style("color", this.config.headercolor);

      // Calculate toolbar bottom border color
      //var borderColor = this._modifyColor(this.config.headercolor, 0.3);
      //domStyle.set(dom.byId("toolbar"), "border-color", borderColor);
      domStyle.set(dom.byId("slideNav"), {
        "background-color": this.config.buttoncolor,
        "color": this.config.buttontextcolor
      });
      domQuery("#closeInfo").style({
        "background": this.config.buttoncolor,
        "border-color": this.config.buttoncolor,
        "background-image": "none",
        "color": this.config.buttontextcolor
      });
    },
    _createWebMap: function (itemInfo, params) {
      arcgisUtils.createMap(itemInfo, "mapDiv", {
        mapOptions: params.mapOptions || {},
        usePopupManager: true,
        layerMixins: this.config.layerMixins || [],
        editable: this.config.editable,
        bingMapsKey: this.config.bingKey
      }).then(lang.hitch(this, function (response) {
          this.map = response.map;
          this.symbolLayer = new GraphicsLayer();
          this.map.addLayer(this.symbolLayer);
          // Add home button
          var home = new HomeButton({
            map: this.map
          }, domConstruct.create("div", {}, domQuery(".esriSimpleSliderIncrementButton")[0], "after"));
          home.startup();
          // show social sharing icons if enabled
          if (this.config.socialshare) {
            domClass.remove(dom.byId("socialToolbar"), "hide");
            // Setup click events for sharing nodes
            require(["application/Share"], lang.hitch(this, function (Share) {
              var share = new Share({
                config: this.config,
                map: this.map,
                title: this.config.title || null,
                summary: this.config.subtitle || null
              });
              domQuery(".share-btn").on("click", lang.hitch(this, function (node) {
                var activeIndex = null;
                if (this.featureSwipe && this.featureSwipe.activeIndex) {
                  activeIndex = this.featureSwipe.activeIndex;
                }
                share.shareLink(node, activeIndex, node.target.id);
              }));
            }));
          }

          // Add overview map if enabled
          if (this.config.overview) {
            require(["esri/dijit/OverviewMap"], lang.hitch(this, function (OverviewMap) {
              var overviewMapWidget = new OverviewMap({
                map: this.map,
                visible: true
              });
              overviewMapWidget.startup();
            }));
          }

          var title = this.config.title || response.itemInfo.item.title;
          document.title = title;
          domAttr.set("toggleInfo", {
            "title": title,
            "aria-label": title
          });

          dom.byId("panelTitle").innerHTML = title;
          dom.byId("description").innerHTML = this.config.description || response.itemInfo.item.description;
          domClass.remove(document.body, "app-loading");

          if (params.markerGraphic) {
            // Add a marker graphic with an optional info window if
            // one was specified via the marker url parameter
            var markerLayer = new GraphicsLayer();

            this.map.addLayer(markerLayer);
            markerLayer.add(params.markerGraphic);

            if (params.markerGraphic.infoTemplate) {
              this.map.infoWindow.setFeatures([params.markerGraphic]);
              this.map.infoWindow.show(params.markerGraphic.geometry);
            }
            this.map.centerAt(params.markerGraphic.geometry);
          }
          if (this.config.legend) {
            // enable legend button and add legend
            require(["esri/dijit/Legend"], lang.hitch(this, function (Legend) {
              if (!Legend) {
                return;
              }
              //get legend layers
              var layers = arcgisUtils.getLegendLayers(response);
              if (layers && layers.length > 0) {
                var legend = new Legend({
                  map: this.map,
                  layerInfos: layers
                }, "legendDiv");
                legend.startup();
              }
            }));
          }
          // Get the analysis layer and make sure it supports statistics
          var analysisLayer = null;

          if (this.config.layerInfo.id !== null && this.config.layerInfo.fields.length > 0) {
            analysisLayer = this.map.getLayer(this.config.layerInfo.id);
          } else {
            console.log("Items", response.itemInfo.itemData.operationalLayers);
            response.itemInfo.itemData.operationalLayers.some(lang.hitch(this, function (l) {
              //if a layer isn't defined get the first feature layer with popups defined from the map
              // and use the first field as the analysis field.

              if (l.layerObject) {
                var type = l.layerType || l.layerObject.type;
                if (l.layerObject.infoTemplate !== undefined && (type === "Feature Layer" || type === "ArcGISFeatureLayer")) {
                  analysisLayer = l.layerObject;
                  this.config.layerInfo.fields = [analysisLayer.fields[0].name];
                  return true;
                }
              } else if (l.featureCollection && l.featureCollection.layers && l.featureCollection.layers.length && l.featureCollection.layers.length > 0) {
                analysisLayer = l.featureCollection.layers[0].layerObject;
                this.config.layerInfo.fields = [analysisLayer.fields[0].name];

              }
            }));
          }
          if (analysisLayer) {
            this._calculateStatistics(analysisLayer);
          }
        }),
        function (error) {
          this.reportError(error);
        });
    },
    _getSymbol: function (layer) {
      var symbol = null;
      if (layer && layer.geometryType) {
        if (layer.geometryType === "esriGeometryPolygon") {
          symbol = this.map.infoWindow.fillSymbol;
          symbol.outline.setColor(this.config.symbolcolor);
          symbol.outline.setWidth(4);
        } else if (layer.geometryType === "esriGeometryPoint") {
          symbol = this.map.infoWindow.markerSymbol;
          symbol.outline.setColor(this.config.symbolcolor);
        } else {
          symbol = this.map.infoWindow.lineSymbol;
          symbol.setColor(this.config.symbolcolor);
          symbol.setWidth(4);
        }
      }
      return symbol;
    },
    _calculateStatistics: function (layer) {
      // Check for advanced query support so we can use order by
      if (layer && layer.type && layer.type === "Feature Layer") {
        if (layer.supportsAdvancedQueries) {
          domClass.add(document.body, "app-loading");
          var query = new Query(),
            fieldName = this._getFields();
          query.where = "1=1";
          query.returnGeometry = false;
          if (fieldName) {
            query.orderByFields = [fieldName + " " + this.config.order]; // field + ASC or DESC
            query.outFields = ["*"];

            layer.queryFeatures(query, lang.hitch(this, function (results) {
              this._getFeatures(results.features, layer);
            }), lang.hitch(this, function (error) {
              console.log("Error", error);
              this.reportError(error);
            }));
          } else {
            console.log("No query field specified");
            this.reportError("Layer does not have a query field specified");
          }
        } else if (layer && layer.graphics && layer.graphics.length > 0) {
          var collField = this._getFields();
          if (collField) {
            collField = ["Name"];
            var g = layer.graphics;
            g.sort(function (obj1, obj2) {
              return obj1.attributes[collField] < obj2.attributes[collField];
            });
            if (this.config.order === "DESC") {
              g.reverse();
            }
            this._getFeatures(g, layer);
          }
        } else {
          this.reportError("Layer needs advanced queries support");
        }
      }
    },
    _getFields: function () {
      var fields = this.config.layerInfo.fields || null,
        fieldName = null;
      if (fields && fields.length) {
        fieldName = fields[0];
        if (fieldName.hasOwnProperty("fields")) {
          fieldName = fieldName.fields[0] || null;
        }
      }
      return fieldName;
    },
    _getFeatures: function (graphics, layer) {
      // get top x features and create slides.
      domClass.remove(document.body, "app-loading");
      var topResults = graphics.slice(0, this.config.count);
      // enable explore button
      domClass.remove("closeInfo", "disabled");
      on.once(dom.byId("closeInfo"), "click", lang.hitch(this, function () {
        // hide the info panel
        domClass.add("titleHeader", "hide");
        domClass.remove("slideNav", "hide");
        domClass.remove("toggleInfo", "hide");
        topResults = topResults.reverse();
        this._createFeatureSlides(topResults, layer);
      }));
      if (this.config.item) {
        dom.byId("closeInfo").click();
      }
    },
    _createFeatureSlides: function (features, layer) {
      this.numSlides = features.length || 0;
      features.forEach(lang.hitch(this, function (feature, i) {
        var idAttributeField = feature.getLayer().objectIdField,
          featureContent = feature.getContent(),
          featureTitle = feature.getTitle();
        // create slides and add to the slide container
        var slide = domConstruct.create("div", {
          className: "swiper-slide",
          id: feature.attributes[idAttributeField]
        }, "slideWrapper");
        var pane = new ContentPane({
          tooltip: feature.getTitle() || feature.attributes[idAttributeField],
          title: featureTitle,
          content: featureContent
        }, domConstruct.create("div"));
        pane.startup();
        domConstruct.place(pane.domNode, dom.byId(slide.id));
      }));

      // Create Slide Gallery for features
      var options = this._defineSwipeOptions(features);
      this.featureSwipe = new Swiper(".swiper-container", options);
      domQuery(".swiper-pagination-bullet").style("background", this.config.navcolor);
      // Add labels if we have bullets or progress bar enabled.
      if (this.config.pagingType.toLowerCase() === "bulletsandlabel" || this.config.pagingType.toLowerCase() === "progress") {
        this.featureSwipe.on("Init", lang.hitch(this, this._createPaginationText));
        this.featureSwipe.init();
        this.featureSwipe.on("TransitionStart", lang.hitch(this, this._createPaginationText));
      }
      // Setup the slider if enabled
      if (this.config.pagingType === "slider") {
        // Uses noUiSlider https://refreshless.com/nouislider/download/
        var slideDiv = domConstruct.create("div", {}, "pageLabel", "last");
        domClass.add(slideDiv, "pagination-slider");
        this.slider = noUiSlider.create(slideDiv, {
          start: [1],
          behavior: "tap-drag, snap",
          step: 1,
          range: {
            "min": [1],
            "max": [features.length]
          }
        });
        domQuery(".noUi-handle").style("color", this.config.navcolor);
        this._updateHandleText(1);
        this.slider.on("slide", lang.hitch(this, function (e) {
          var num = Number(e[0]);
          if (this.config.autoloop) {
            this.featureSwipe.fixLoop();
          }
          if (num) {
            this._updateHandleText(num);
            this._selectFeatures(num, layer);
            this.featureSwipe.slideTo(num);
          }
        }));
      }
      // Setup click handlers
      this._setupButtonClickHandlers(layer);

      // Navigate to the first feature or if there's a url param go there
      if (this.featureSwipe && this.featureSwipe.slides && this.featureSwipe.slides.length && this.featureSwipe.slides.length > 0) {
        if (this.config.item) {
          var slide = this.featureSwipe.slides[this.config.item];
          if (slide) {
            this._selectFeatures(slide.id, layer);
            this.featureSwipe.slideTo(this.config.item);
          }
        } else {
          this._goToSlide(this.featureSwipe, layer);
        }
      }
      this.featureSwipe.on("SlideChangeStart", lang.hitch(this, function (e) {
        if (this.config.pagingType === "slider" && this.slider) {
          if (e.activeIndex === 0) {
            e.activeIndex = this.numSlides;
          } else if (e.activeIndex > this.numSlides) {
            e.activeIndex = 1;
          }
          this.slider.set(e.activeIndex);
          this._updateHandleText(e.activeIndex);
        }
        this._goToSlide(this.featureSwipe, layer);
      }));
    },
    _updateHandleText: function (num) {
      var handle = domQuery(".noUi-handle")[0];
      if (handle) {
        handle.innerHTML = "<span>" + num + "</span>";
      }
    },
    _setupButtonClickHandlers: function (layer) {
      //setup click handle for button to toggle title and desc on small devices
      on(dom.byId("toggleInfo"), "click", lang.hitch(this, function (e) {
        this._toggleInfoPanel("info", layer);
        domClass.add("toggleInfo", "hide");
      }));
      // Button on info dialog that closes info panel
      on(dom.byId("closeInfo"), "click", lang.hitch(this, function (e) {
        this._toggleInfoPanel("popup", layer);
        domClass.remove("toggleInfo", "hide");
      }));
    },
    _defineSwipeOptions: function (features) {
      var swipeOptions = {
        a11y: true,
        spaceBetween: 10,
        grabCursor: true,
        autoplay: this.config.autoplay ? this.config.autoplayspeed : 0,
        nextButton: ".swiper-button-next",
        prevButton: ".swiper-button-prev",
        pagination: ".swiper-pagination",
        loop: this.config.autoloop
      };
      // Adds a progress bar - also shows the custom label text
      if (this.config.pagingType.toLowerCase() === "progress") {
        swipeOptions.paginationType = "progress";
      }
      // Add extra padding so label and bullets fill space correctly
      if (this.config.pagingType.toLowerCase() === "bulletsandlabel") {
        domStyle.set(dom.byId("slideNav"), "height", "auto");
      }
      // Add bullets to the pagination area. Feature popup title is used for the slide tooltip
      if (this.config.pagingType.toLowerCase() === "bullets" || this.config.pagingType.toLowerCase() === "bulletsandlabel") {
        if (this.numSlides > 15) {
          domStyle.set(dom.byId("slideNav"), {
            "margin": "auto",
            "line-height": "normal"
          });
        }
        swipeOptions.paginationClickable = true;
        swipeOptions.paginationBulletRender = lang.hitch(this, function (index, className) {
          var f = features[index];
          var title = f.getTitle();
          var l = f.getLayer();
          if (!title) {
            title = f.attributes[l.displayField] || null;
          }
          title = esriLang.stripTags(title);
          return "<span title='" + title + "' class='" + className + "'></span>";
        });
      }
      // Label's only or label + slider
      if (this.config.pagingType.toLowerCase() === "label") {
        swipeOptions.paginationType = "custom";
        swipeOptions.paginationCustomRender = lang.hitch(this, this._createPaginationText);
      }
      if (this.config.pagingType.toLowerCase() === "slider") {
        swipeOptions.paginationType = "custom";
      }
      return swipeOptions;
    },
    _createPaginationText: function (swiper, current, total) {
      if (!swiper) {
        swiper = this.featureSwipe;
      }
      // Create pagination label text
      var template = this.config.rankLabelTemplate;
      if (template === "") {
        template = "Rank {current} of {total}";
      }
      var currentSlide = this.numSlides;
      if (this.config.autoloop) {
        swiper.fixLoop();
        currentSlide = currentSlide + 1;
      }
      var labelObj = {
        current: currentSlide - swiper.activeIndex,
        total: this.numSlides
      };
      dom.byId("pageLabel").innerHTML = "<span class='page-label'>" + lang.replace(template, labelObj) + "</span>";
    },
    _goToSlide: function (featureSwipe, layer) {
      this._selectFeatures(featureSwipe.slides[featureSwipe.activeIndex].id, layer);
    },
    _toggleInfoPanel: function (active, layer) {
      domQuery(".panel-nav").addClass("hide");
      // remove just the active
      if (active === "popup") {
        domClass.remove("popupContainer", "hide");
        domClass.remove("slideNav", "hide");
      } else { // activate info
        layer.show();
        domClass.remove("titleHeader", "hide");
      }
    },
    _selectFeatures: function (id, layer) {
      this.symbolLayer.clear();
      var q = new Query();
      q.objectIds = [id];
      layer.selectFeatures(q).then(lang.hitch(this, function () {
        var sel = layer.getSelectedFeatures();
        var level = this.config.selectionZoomLevel;
        var scale = this.config.selectionZoomScale;
        if (sel && sel.length && sel.length > 0) {
          var geometry = sel[0].geometry;
          this.symbolLayer.add(new Graphic(geometry, this._getSymbol(layer, sel[0])));
          var extent = graphicsUtils.graphicsExtent(sel);
          var zoomLoc = extent.getCenter();
          if (scale) {
            this.map.setScale(scale);
            this.map.centerAt(zoomLoc);
          } else if (level !== null && level !== undefined) {
            this.map.centerAndZoom(zoomLoc, level);
          } else {
            this.map.setExtent(extent, true);
          }
        }
      }));
    },
    _modifyColor: function (color, percent) {
      // Lighten/darken colors
      //http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
      var f = parseInt(color.slice(1), 16),
        t = percent < 0 ? 0 : 255,
        p = percent < 0 ? percent * -1 : percent,
        R = f >> 16,
        G = f >> 8 & 0x00FF,
        B = f & 0x0000FF;
      return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
    }

  });
});
/**
 * 
Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U

This file is part of True Network Libray.

True Network Libray is free software: you can redistribute it and/or modify it under the terms of the 
GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
True Network Libray is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
License for more details.

You should have received a copy of the GNU Affero General Public License along with True Network Library If not, 
see http://www.gnu.org/licenses/.

For those usages not covered by the GNU Affero General Public License please contact with:: ogondio@tid.es  
 * 
 */



/**

Oscar Gonzalez de Dios
Ayk Papoyan
Jaume Marhuenda

Library to create and draw Network Graphs

Send messages between nodes

 */

/**
    @namespace NameSpace of the tNetwork Library
 */
tNetwork = {};

/**
    @class Represents a NetworkNode
 */
tNetwork.NetworkNode = function () {};


/**
 * @class Represents a NetworkLayer
 */
tNetwork.NetworkLayer = function () {};


/**
 * @class Represents a NetworkBus
 * 
 */
tNetwork.NetworkBus = function () {};

/**
 * @class Represents a Network Bus Conection
 * 
 */
tNetwork.NetworkBusLink = function(){};


/**
    @class Represents a Link (can be unidirectional or bidirectional)
 */
tNetwork.NetworkLink = function () {};

(function (undefined) {
	"use strict";
	var NetworkLink = tNetwork.NetworkLink,
	NetworkNode = tNetwork.NetworkNode,
	NetworkBus= tNetwork.NetworkBus,
	NetworkLayer = tNetwork.NetworkLayer,
	NetworkBusLink = tNetwork.NetworkBusLink;
	/**
        @class Represents a Network
	 */
	tNetwork.Network = function () {

		this.currentX = 0;
		this.currentY = 0;
		this.currentMatrix = 0;
		this.selectedElement = 0;

		this.editingNetwork = 0;
		this.mouseDown = 0;
		this.eventProcessed = 0;
		this.zoom = 1;
		//this.that = this;

		var that = this;


		this.selectedLinkList = [];
		this.selectedBusList = [];
		this.selectedBusLinkList = [];		


		//List of Nodes
		this.nodeList = [];

		//List of Links

		this.linkList = [];

		//List of Layers

		this.layerList = [];

		//List of buses

		this.busList = [];

		//List of bus links

		this.busLinkList = [];


		//List of supported types





		//Version of the tNetwork library
		this.version = "1.09.01-dev";

		/**
            @function Return version of the library
		 */
		this.getVersion = function () {
			return this.version;
		};


		/**
            @function Add a the defs section of the svg
		 */
		this.addDefs = function (defs_id) {
			this.defs_id = defs_id;
		};

		/**
          @function Sets properties to an element
		 */
		this.setProperties = function(element,properties)
		{
			if(properties!==undefined)
			{
				element.properties = properties;
			}
		};


		/**
        @function Add a SVG to draw the network
		 */
		this.addSVG = function (svg_id) {
			this.svg_id = svg_id;
		};






		/**
        @function Add a node to the network
        @param id Unique id of the node.
        @param x x coordinate of the node
        @param y y coordinate of the node
		 */
		this.addNode = function (id, x, y,href,nodeStyle,properties,label_text) {
			var myNode = new NetworkNode();
			this.nodeList[id] = myNode;
			myNode.show = true;
			myNode.elementType = "node";
			myNode.x = x;
			myNode.y = y;
			myNode.id = id;
			myNode.labels = {};
			myNode.numLabels = 0;
			myNode.labelOffset = 13;


			//Put a title if it doesn't have
			if(properties === "")
			{
				properties = {
						p1 : label_text,
						p2 : id
				};
			}
			if (label_text!== undefined && label_text !== "")
			{
				this.addLabel("node",id,label_text);				
			}


			if (nodeStyle !== undefined && nodeStyle !== "" &&
				nodeStyle.height == undefined && nodeStyle.width == undefined)
			{
					myNode.style = nodeStyle;						
			}
			else{
				myNode.style = $.extend(true, {},tNetwork.styles.node.defaultNode);
			}
			if (href!==undefined && href !== "")
			{
				var tmpImg = new Image();
				if (nodeStyle == undefined || (nodeStyle.height == undefined && nodeStyle.width == undefined))
				{
					$(tmpImg).on('load',function(){
					  myNode.style.params.width = tmpImg.width;
					  myNode.style.params.height = tmpImg.height;
					});
				}
				else
				{
					 myNode.style.params.width = nodeStyle.width;
					 myNode.style.params.height = nodeStyle.height;					
				}
				tmpImg.src= href;
				myNode.style.params.href = href;
				myNode.style.type = "image";
				
			}

			this.setProperties(myNode, properties);

			this.addHighlight(id);
		};


		/**
    @function Add a layer to the network
    @param layer_id Unique id of the layer.
    @param height height of the layer
    @param fill of the layer
    @param y y coordinate of the layer
		 */        
		this.addLayer = function (layer_id,height,y,fill,properties) {
			var myLayer = new NetworkLayer();
			myLayer.show = true;
			myLayer.elementType = "layer";
			myLayer.y1 = y;
			myLayer.y2 = y+height;
			if (fill==undefined || fill == "")
				fill = "#CCCCCC";
			myLayer.style= {
					id: layer_id,
					type: "rect",
					params: 
					{
						'class': "defaultLayer",
						transform: "matrix(1 0 0 1 0 0)",
						style:"fill:"+fill,
						width : "6000",
						height :height,
						x : "-3000",
						y : y,
					}

			};

			this.layerList[layer_id] = myLayer; 
			this.setProperties(myLayer, properties);

		};        


		/**
    @function Add a bus to the network
    @param layer_id Unique id of the bus.
    @param min_height minimum height of the bus
    @param x x coordinate of the  bus
		 */        
		this.addVerticalBus = function (bus_id,x,min_height,style,properties,label_text) {
			var myBus = new NetworkBus();
			myBus.show = true;
			myBus.elementType ="bus";
			myBus.id = bus_id;
			myBus.x = x;
			myBus.dy = 0;
			myBus.dx = 0;
			myBus.labels = {};
			myBus.numLabels = 0;
			myBus.labelOffset = 13;

			if (style !== undefined && tNetwork.styles.bus[style] !== undefined)
			{
				myBus.style = $.extend(true, {}, tNetwork.styles.bus[style]); 					
			}
			else if(tNetwork.styles.bus[bus_id] === undefined)
			{
				myBus.style = $.extend(true, {}, tNetwork.styles.bus.defaultBus);
			}
			else
			{
				myBus.style = $.extend(true, {}, tNetwork.styles.bus[bus_id]);   		
			}
			if (style !== undefined)
			{
				if (style.color !== undefined)
					myBus.style.params.stroke = style.color;
				if (style.width !== undefined)
					myBus.style.params["stroke-width"] = style.width;
			}
			

			myBus.style["id"] = bus_id;
			if (min_height !== undefined && min_height !== "")
				myBus.style["min_height"] = min_height;
			else
				myBus.style["min_height"] = 0;				
			this.busList[bus_id] = myBus; 
			this.setProperties(myBus, properties);

			if (label_text !== undefined && label_text !== "")
			{
				this.addLabel("bus",myBus.id,label_text);				
			}

		};     


		/**
    @function Add a bus link to the network 
    @param bus id of the bus
    @param node id of the nose
    @param properties that are shown
		 */
		this.addBusLink = function (bus, node,properties,label_text){
			var myBusLink = new NetworkBusLink();
			myBusLink.show = true;
			myBusLink.elementType = "buslink";			
			myBusLink.id = bus+":"+node;
			myBusLink.labels = {};
			myBusLink.numLabels = 0;
			myBusLink.labelOffset = 13;
			myBusLink.bus = this.busList[bus];
			myBusLink.node = this.nodeList[node];


			if (myBusLink.bus === undefined || myBusLink.node === undefined)
			{
				console.log(myBusLink.bus);
				console.log(myBusLink.node);
				console.log(myBusLink.id+" Not created, missing some element");
			}
			else
			{
				myBusLink.style = myBusLink.bus.style;
				this.busLinkList[bus + ":" + node] = myBusLink;
				this.setProperties(myBusLink, properties);	
			}
			
			if (label_text !== undefined && label_text !== "")
			{
				this.addLabel("link",myBusLink.id,label_text);				
			}

		};

		/**
    @function Add a link to the network 
    @param source Id of the source node
    @param destination Id of the destination node
    @param {boolean} bidirectional If the link is bidirectional (true) or unidirectional (false)
		 */
		this.addLink = function (source, destination, bidirectional,style,properties,label_text) {
			var myLink = new NetworkLink();
			myLink.show = true;
			myLink.elementType = "link";
			myLink.id = source+":"+destination;
			myLink.labels = {};
			myLink.numLabels = 0;
			myLink.labelOffset = 13;


			myLink.src = this.nodeList[source];
			myLink.dst = this.nodeList[destination];



			if ((myLink.src === undefined) || (myLink.dst === undefined)){
				console.log("WARNING !! FIXME!! MULTIDOMAIN LINK, NOT IMPLEMENTED YET");
				console.log("source: "+source+" dest: "+destination);
				return;
			}
			this.linkList[myLink.id] = myLink;
			myLink.bidirectional = bidirectional;

			if (myLink.bidirectional === true) {
				myLink.style = $.extend(true, {},tNetwork.styles.link.defaultBidirectionalLink);
				if (style !== undefined && style!=="" && style.color == undefined && style.stroke ==undefined){
					myLink.style = style;
				}

			} else {
				myLink.style = $.extend(true, {},tNetwork.styles.link.defaultUnidirectionalLink);
				myLink.style.arrow = tNetwork.styles.arrow.triangleArrow;
				if (style !== undefined && style!=="" && style.color == undefined && style.stroke ==undefined){
					myLink.style = style;
					myLink.style.arrow = tNetwork.styles.arrow.triangleArrow;
				}
			}
			if (style !== undefined && style !== "")
			{
				if (style.color !== undefined)
				{
					myLink.style.params["class"] = "default";
					myLink.style.params.stroke=style.color;
				}
				if (style.width !== undefined)
				{
					myLink.style.params["stroke-width"]=style.width;	
				}
			}
			
			if (label_text !== undefined && label_text !== "")
			{
				this.addLabel("link",myLink.id,label_text);				
			}
			
			this.setProperties(myLink, properties);
		};


		/**
	    @function Clear all the labels of an element 
	    @param type type of the element: link, node etc..
	    @param id id of the element
		 */		
		this.clearLabels = function(type,id)
		{
			var element = that.elements[type]["list"][id];
			if (element !== undefined)
			{
				element.labels = {};
				element.numLabels = 0;		

			}
		};
		/**
	    @function Gets the text of the label on the position pos 
	    @param type type of the element: link, node etc..
	    @param id id of the element
		 */		
		this.getLabelText = function(type,id,pos)
		{
			var element = that.elements[type]["list"][id];
			if (element !== undefined && element.numLabels>pos)
			{
				return element.labels[pos].label;			
			}	
			else return "";
		};

		/**
	    @function Add a label to an element
	    @param type must be one of the supported types: node, bus...
	    @param id id of the element
	    @param label_text text of the label 
	    @param posX relative position in the X axis: right, left, center
	    @param posY relative position in the Y axis: top, bottom, center
		 */		
		this.addLabel = function (type,id,label_text,posX,posY,showOption) 
		{
			var element,numLabels,list;
			var setlabelpos;
			var defaultX,defaultY;
			var show = false;

			if (show!==undefined && show !=="")
			{
				if (showOption === "true" || showOption === true)
				{
					show = true;
				}
			}

			setlabelpos = that.elements[type]["setlabel"];


			//If the element doesnt have a setlabel function, it doesnt support labels
			if (setlabelpos !== undefined)
			{
				defaultX = that.elements[type]["labelposx"];
				defaultY = that.elements[type]["labelposy"];		
				list = that.elements[type]["list"];


				if (list !== undefined && list[id]!== undefined)
				{
					element = list[id];
					numLabels = element.numLabels;
					element.labels[numLabels] = {};
					element.labels[numLabels].label = label_text;
					element.labels[numLabels].show = show;
					if (posY ==="top" || posY==="bottom" || posY==="center")
						element.labels[numLabels].posY = posY;
					else
						element.labels[numLabels].posY = defaultY;	

					if (posX ==="right" || posX ==="left" || posX ==="center")
						element.labels[numLabels].posX = posX;
					else
						element.labels[numLabels].posX = defaultX;						
					element.numLabels ++;
				}
			}
			else
			{
				console.log("label not supported yet for "+type);
			}

		};


		/**
	    @function Adds a highlight for the element. On this version only nodes are supported
	    @param element_id id of the node
	    @param x posX of the node
	    @param y posY of the node
	    @param style optional: style of the highlight
		 */	
		this.addHighlight = function(element_id,style)
		{	
			var element = this.elements["node"]["list"][element_id];
			var myHighlight = new NetworkNode();
			myHighlight.show = false;

			if (element !== undefined)
			{
				if (style ===undefined)
				{
					if (element.style.type ==="circle")
					{
						myHighlight.style = $.extend(true, {}, tNetwork.styles.node.defaultHighlightCircle);  						
					}
					else
					{
						myHighlight.style = $.extend(true, {}, tNetwork.styles.node.defaultHighlight);  						
					}
				}
				else
				{
					myHighlight.style =  $.extend(true, {}, style); 
				}
				element.highlight = myHighlight;
				element.highlight.show = false;
			}

		};

		/**
	    @function toggle the highlight of a link or a buslink (on/off)
	    @param srcId source of the node of the link
	    @param dstId dest of the node of the link
	    @param show flag 
		 */	
		this.toggleHighlightLine = function(srcId,destId,show)
		{
			var listl = this.elements["link"]["list"];
			var listbl = this.elements["buslink"]["list"];
			var lists = new Array(listl,listbl);
			var id1 = srcId+":"+destId;
			var id2 = destId+":"+srcId;

			var list="";
			var el="";
			var svg;
			var width;
			var flag=false;
			for (list in lists)
			{
				for (el in lists[list])
				{
					if (id1===el || id2===el)
					{
						svg = lists[list][el].svg;
						if (show!==undefined)
						{
							flag = (show==="true" || show == true);
						}
						else
							flag = (svg!==undefined && svg.getAttributeNS(null,"class") !== "selectedLink");
						if (flag)	
						{

							width = svg.getAttributeNS(null,"stroke-width");	
							svg.setAttributeNS(null,"class","selectedLink");
							svg.setAttributeNS(null,"stroke-width",width*1+1);							
						}
						else
						{
							svg.setAttributeNS(null,"class",lists[list][el].style.params.class);
							svg.setAttributeNS(null,"stroke-width",lists[list][el].style.params["stroke-width"]);																
							if (lists[list][el].style.params.stroke!==undefined)
								svg.setAttributeNS(null,"stroke",lists[list][el].style.params.stroke);																

						}
					}
				}
			}
		};

		/*
	    @function toggle the highlight of a bus (on/off)
	    @param busId of the bus
	    @param show flag 
		 */			
		this.toggleHighlightBus = function(busId,show)
		{
			var el = this.elements["bus"]["list"][busId];
			var svg,width;
			if (el !== undefined)
			{
				svg = el.svg;
				if (show && svg.getAttributeNS(null,"class") !== "selectedLink")
				{
					width = svg.getAttributeNS(null,"stroke-width");

					svg.setAttributeNS(null,"class","selectedLink");
					svg.setAttributeNS(null,"stroke-width",width*1+1);							
				}				
			}
		};


		this.checkNetworkStatus = function()
		{
			if (that.svg_id == null)
			{
				console.log("no hay svg, creando uno..");
				that.svg_id="tNetworkSVG";
				var str = 	'<svg id="'+that.svg_id+'" xmlns="http://www.w3.org/2000/svg"';
				str+=' xmlns:xlink="http://www.w3.org/1999/xlink" height="100%" width="100%">';
				$("body").append(str);
			}
			if (this.defs_id == null)
			{
				console.log("no hay defs, creando uno..");	
				this.defs_id = "tNetworkDefs";
				var str = '<defs id="'+this.defs_id+'"></defs>';
				$("body").append(str);
			}				
		};




		/***************DRAWING FUNCTIONS******************/	

		/**
	    @function Draws the network
		 */	
		this.drawNetwork = function () {
			var arrowStyle;
			var list;
			var elementType;
			var elementId;


			this.checkNetworkStatus();
			
			$("#"+that.svg_id+" g").remove();

			this.net = document.createElementNS(this.svgNS, "g");

			if (this.globalTransformMatrix !== undefined)
			{
				this.net.setAttributeNS(null, "transform", this.globalTransformMatrix);
			}

			document.getElementById(that.svg_id).appendChild(this.net);			

			//TODO: ???
			for (arrowStyle in tNetwork.styles.arrow) {
				this.addArrowToDefs(tNetwork.styles.arrow[arrowStyle],arrowStyle);
			}			

			for (elementType in this.elements)
			{
				list = this.getList(elementType);
				for (elementId in list)
				{
					if (list.hasOwnProperty(elementId) && list[elementId].show === true)
					{
						this.draw(list[elementId]);
					}
				}
			}
		};



		/**
		    @function Draw an element in the actual network, including its labels and properties
		    @param element element to draw
		 */				
		this.draw = function(element)
		{
			var drawfun = this.elements[this.getType(element)]["draw"];
			var setlabelfun,label_id;

			if (drawfun!==undefined)
			{
				//At first we draw the element by itself

				drawfun.call(this,element);
				this.drawProperties(element);

				//Then we draw the associated labels
				setlabelfun = this.elements[this.getType(element)]["setlabel"];

				if (setlabelfun !== undefined) {
					var labelLength,labelX,labelY;
					var counter = this.labelCounter();

					for (label_id in element.labels) {
						this.drawLabel(element,label_id,counter);
						this.drawProperties(element.labels[label_id]);
					}
				}
			}
		};





		/**
	    @function Draws a layer in the network
	    @param layer layer
		 */		
		this.drawLayer = function (layer){
			var myLayer;
			myLayer = document.createElementNS(this.svgNS, layer.style.type);
			tNetwork.setSVGAttributes(myLayer, layer.style.params);  
			myLayer.setAttributeNS(null,"id",layer.style.id);
			layer.svg = myLayer;
			this.net.appendChild(myLayer);

		};

		/**
	    @function Draws a bus in the network
	    @param bus bus
		 */		
		this.drawBus = function(bus){
			var myBus;
			var busList = []; 
			myBus = document.createElementNS(this.svgNS, bus.style.type); 
			myBus.setAttributeNS(null,"id",bus.style.id);
			bus.svg = myBus;
			bus.dy = 0;
			bus.dx = 0;

			busList[bus.style.id] = bus;
			tNetwork.setSVGAttributes(bus.svg, bus.style.params);  

			bus.svg.setAttributeNS(null, "x1", bus.x);
			bus.svg.setAttributeNS(null, "x2", bus.x);			
			this.setBusPosition(bus);


			this.net.appendChild(myBus);



		};

		/**
    @function Draw a node in the SVG
    @param node node element 
    @param id Id of the node. Will be used as the label 0
		 */
		this.drawNode = function (node) {
			var myNode, nodeevent;


			myNode = document.createElementNS(this.svgNS, node.style.type);
			tNetwork.setSVGAttributes(myNode, node.style.params);
			myNode.setAttributeNS(null, "id", node.id);
			node.svg = myNode;


			this.drawHighlight(node);

			if (node.style.type === "circle") {
				myNode.setAttributeNS(null, "cx", node.x);
				myNode.setAttributeNS(null, "cy", node.y);

			} else if (node.style.type === "image") {
				myNode.setAttributeNS(null, "x", node.x - (node.style.params.width / 2));
				myNode.setAttributeNS(null, "y", node.y - (node.style.params.height / 2));

				myNode.setAttributeNS(this.xlinkNS, "href", node.style.params.href);

			} else {
				throw "type not supported, ask for it to ogondio";
			}
			this.net.appendChild(myNode);

			for (nodeevent in this.defaultNodeHandlers) {
				//console.log("ADD EVENT " + nodeevent + " en " + node.id);
				myNode.addEventListener(nodeevent, this.defaultNodeHandlers[nodeevent], false);
			}
		};

		/**
	    @function Draws the highlight of an element
	    @param element element
		 */				
		this.drawHighlight = function (element){

			if (element.highlight !== undefined && element.highlight.show)
			{
				var svgHighlight;
				svgHighlight = document.createElementNS(this.svgNS,element.highlight.style.type);
				element.highlight.svg = svgHighlight;
				tNetwork.setSVGAttributes(svgHighlight, element.highlight.style.params);


				this.net.appendChild(svgHighlight);

				if (element.highlight.style.type === "circle") {
					svgHighlight.setAttributeNS(null, "cx", element.x);
					svgHighlight.setAttributeNS(null, "cy", element.y);

				}	
				else if (element.highlight.style.type === "rect") {
					svgHighlight.setAttributeNS(null, "x", element.x-element.style.params.width/2);
					svgHighlight.setAttributeNS(null, "y", element.y-element.style.params.height/2);				
					
				}
				this.setHighlightPos(element);

			}
		};

		//TODO:??? ver cuando se usa
		this.hideHighlight = function(){
			var el="", list;
			list = this.elements["node"]["list"];
			for (el in list)
			{
				if(list[el].highlight !== undefined)
					list[el].highlight.show = false;
			}

		};

		/**
        @function Draw a link in the SVG
		 */
		this.drawLink = function (link) {
			var svgLink, linkStyle, arrowStyle, xoffset, yoffset, bidirectional, dx,
			dy, tan, arrow, dx1, x1, y1, dy1, x2, linkevent, src, dst;
			//Create SVG element that holds the link
			svgLink = document.createElementNS(this.svgNS, "line");
			link.svg = svgLink;
			tNetwork.setSVGAttributes(svgLink, link.style.params);
			bidirectional = link.bidirectional;
			//calculate endpoints of the line
			src = {};
			dst = {};
			tNetwork.crossingOutPoint(link.src.style, link.src.x, link.src.y, link.dst.x, link.dst.y, link.style.offset, src);
			tNetwork.crossingOutPoint(link.dst.style, link.dst.x, link.dst.y, link.src.x, link.src.y, -1 * link.style.offset, dst);

			svgLink.setAttributeNS(null, "x1", link.src.x + src.x);
			svgLink.setAttributeNS(null, "y1", link.src.y + src.y);
			svgLink.setAttributeNS(null, "x2", link.dst.x + dst.x);
			svgLink.setAttributeNS(null, "y2", link.dst.y + dst.y);
			svgLink.setAttributeNS(null, "id", link.src.id + ":" + link.dst.id);

			this.net.appendChild(svgLink);
			for (linkevent in this.defaultLinkHandlers) {
				svgLink.addEventListener(linkevent, this.defaultLinkHandlers[linkevent], false);
			}
		};

		/**
        @function Draw a link in the SVG
		 */
		this.drawBusLink = function (busLink) {
			var svgLink, linkStyle, arrowStyle, xoffset, yoffset, bidirectional, dx,
			dy, tan, arrow, dx1, x1, y1, dy1, x2, linkevent, src, dst;
			var svgTitle, lines, line,str;
			//Create SVG element that holds the link
			svgLink = document.createElementNS(this.svgNS, "line");
			busLink.svg = svgLink;


			//TODO: tNetwork.setSVGAttributes(svgLink, busLink.style.params);
			//bidirectional = link.bidirectional;
			//calculate endpoints of the line
			src = {};
			tNetwork.crossingOutPoint(busLink.node.style, busLink.node.x, busLink.node.y, busLink.bus.x, busLink.node.y, 0, src);
			tNetwork.setSVGAttributes(svgLink, busLink.bus.style.params);             



			svgLink.setAttributeNS(null, "x1", busLink.node.x + src.x);
			svgLink.setAttributeNS(null, "y1", busLink.node.y+src.y);
			svgLink.setAttributeNS(null, "x2", busLink.bus.x);
			svgLink.setAttributeNS(null, "y2", busLink.node.y+src.y);
			svgLink.setAttributeNS(null, "id", busLink.id);

			this.net.appendChild(svgLink);
			for (linkevent in this.defaultLinkHandlers) {
				svgLink.addEventListener(linkevent, this.defaultLinkHandlers[linkevent], false);
			}

		};


		/**
	    @function Draw a label of an element
	    @param element element 
	    @param label_id id of the label
	    @param counter needed for the label position relative to other labels
		 */
		this.drawLabel = function(element,label_id,counter)
		{
			var myLabel,txt,rStyle,svgSquare;			
			myLabel = document.createElementNS(this.svgNS, "text");
			this.net.appendChild(myLabel);
			myLabel.setAttributeNS(null, "class", "defaultLabel");
			txt = document.createTextNode(element.labels[label_id].label);
			myLabel.appendChild(txt);		

			element.labels[label_id].svg = myLabel; 
			//Create rectangle
			rStyle = tNetwork.styles.labelRect;
			svgSquare = document.createElementNS(this.svgNS, rStyle.type);
			tNetwork.setSVGAttributes(svgSquare, rStyle.params);				
			element.labels[label_id].labelRect = svgSquare;	

			this.net.appendChild(svgSquare);
			this.net.appendChild(myLabel);			


			//Set the label position
			this.setLabelPos(element,element.labels[label_id],counter);	
		};





		/**
    @function Draw the properties of an element when mouseover. Element must have a properties field
    @param element 
		 */    
		this.drawProperties = function(element)
		{
			var svgTitle,svg, lines, line,str; 
			/****PROPIEDADES******/
			if(element.properties !==undefined )
			{
				svg = element.svg;

				svgTitle = document.createElementNS(this.svgNS,"title");


				lines = element.properties;
				str = "";
				for (line in lines)
				{
					str+=lines[line]+"\n";


				}
				$(svgTitle).text(str);

				svg.appendChild(svgTitle); 
			}
		};


		/**
	    @function hides an element and all his linked components (links, labels etc).
	    		The element can be selected with id+type, or element
		 */   		
		this.hideElement = function(id,type,element)
		{
			this.changeElementVisibility(false, id, type, element);
		};

		/**
	    @function shows an element and all his linked components (links, labels etc).
	    		The element can be selected with id+type, or element
		 */   			
		this.showElement = function(id,type,element)
		{
			this.changeElementVisibility(true, id, type, element);
		};


		/**
	    @function starts edit mode.
		 */   				
		this.startEditMode = function () {
			var nodeid, busid,svg;

			that.selectedElement = 0;
			if(that.editMode){
				return;
			}

			that.editMode = true;
			that.editingNetwork = this;
			for (nodeid in that.nodeList) {
				if(that.nodeList[nodeid].show===true){	;
				// console.log("Node " + nodeid+"nodeSVG "+that.nodeList[nodeid].svg.getAttributeNS(null, "transform"));
				that.setElementProperty(that.nodeList[nodeid],'cursor','move'); 
				that.addEventHandlerElement(that.nodeList[nodeid],'mousedown',that.selectElement);
				//that.addEventHandlerElement(that.nodeList[nodeid],'mousedown',that.pruebaClick);
				}
			}
			for (busid in that.busList) {
				if(that.busList[busid].show===true){
					that.setElementProperty(that.busList[busid],'cursor','move'); 
					that.addEventHandlerElement(that.busList[busid],'mousedown',that.selectElement);            	
					//that.addEventHandlerElement(that.busList[busid],'mousedown',that.pruebaClick);            	
				}	
			}

			svg = document.getElementById(that.svg_id);
			svg.addEventListener('mouseup', that.selectSVGUp , false);
			svg.addEventListener('mousedown', that.selectSVGDown , false);
			svg.addEventListener('mousemove', that.selectSVGMove , false);
			svg.addEventListener('mouseout', that.selectSVGOut , false);

			if ((navigator.userAgent.indexOf('Chrome') !== -1)||(navigator.userAgent.indexOf('Safari')!== -1)||
					(navigator.userAgent.indexOf('Opera')!== -1)||(navigator.userAgent.indexOf('IE9')!== -1)){
				svg.addEventListener('mousewheel', that.scrolling , false);
			}else if ((navigator.userAgent.indexOf('Firefox'))){
				svg.addEventListener('DOMMouseScroll', that.scrolling , false);
			}else{
				alert("This browser doesn't support scrolling");
			}

			that.setDefaultNodeEventHandler('mousedown',that.selectElement);

			that.boxX = document.getElementById(that.svg_id).getBBox().x;
			that.boxY = document.getElementById(that.svg_id).getBBox().y;
			that.mouseDown = 0;
		};


		/**
	    @function stops edit mode.
		 */   
		this.stopEditMode = function () {
			var svg,nodeid;

			that.selectedElement = 0;
			svg = document.getElementById(that.svg_id);

			svg.removeEventListener('mouseup',that.selectSVGUp,false);
			svg.removeEventListener('mousedown',that.selectSVGDown,false);
			svg.removeEventListener('mousemove',that.selectSVGMove,false);
			svg.removeEventListener('mouseout',that.selectSVGOut,false);

			if ((navigator.userAgent.indexOf('Chrome') !== -1)||(navigator.userAgent.indexOf('Safari')!== -1)||
					(navigator.userAgent.indexOf('Opera')!== -1)||(navigator.userAgent.indexOf('IE9')!== -1)){
				svg.removeEventListener('mousewheel', that.scrolling , false);
			}else if ((navigator.userAgent.indexOf('Firefox'))){
				svg.removeEventListener('DOMMouseScroll', that.scrolling , false);
			}else{
			}

			for (nodeid in that.nodeList) {
				that.setElementProperty(that.nodeList[nodeid],'cursor','move'); 
				that.removeEventHandlerNode(that.nodeList[nodeid],'mousedown',that.selectElement);
			}


			this.editMode = false;
			for (nodeid in this.nodeList) {
				this.setElementProperty(this.nodeList[nodeid],'cursor','move'); 
			}
		};





		/**
	    @function Highlights or hides all the elements of the topology
	    @param showOp true to highlight all, false to hide all
			 */   		
	    this.highlightAll = function(showOp)
	      {
	    	var show;
	    	if (showOp!==undefined)
	    		show = showOp;
	    	
	    	for (var el in that.elements["node"]["list"])
	    	{
	    	  that.toggleHighlight("node",that.elements["node"]["list"][el].id,show);	  
	    	  if (show === undefined) show = that.elements["node"]["list"][el].highlight.show;
	    	}
	    	//We need to draw network because the highlight of the node goes first.
	    	that.globalTransformMatrix= $("#mySVG g").attr("transform");
	    	that.drawNetwork();
	    	
	    	for (var el in that.elements["link"]["list"])
	    	{
	    		that.toggleHighlight("link",that.elements["link"]["list"][el].id,show);
	    	}
	    	
	    	for (var el in that.elements["buslink"]["list"])
	    	{
	    		that.toggleHighlight("buslink",that.elements["buslink"]["list"][el].id,show);
	  		} 
	    	
	    	for (var el in that.elements["bus"]["list"])
	    	{
	    		that.toggleHighlight("bus",that.elements["bus"]["list"][el].id,show);
	  		}      	
	      };







		/***************************** ADITIONAL FUNCTIONS NEEDED *******************/

































		/************************LABELS****************/
		this.labelCounter = function()
		{
			var counter;
			counter = {};
			counter["bottom:center"]=0;
			counter["bottom:left"]=0;
			counter["bottom:right"]=0;


			counter["top:center"]=0;				
			counter["top:left"]=0;				
			counter["top:right"]=0;				

			counter["center:center"]=0;					
			counter["center:left"]=0;	
			counter["center:right"]=0;	

			return counter;
		};		


		this.setLabelsPos = function(element)
		{
			var label,counter;

			counter = this.labelCounter();
			for(label in element.labels)
			{
				this.setLabelPos(element,element.labels[label],counter);
			}
		};


		this.setLabelPos = function(element,label,counter)
		{
			var setLabelfun;

			setLabelfun = this.elements[element.elementType]["setlabel"];
			if (setLabelfun !== undefined)
			{
				setLabelfun.call(this,element,label,counter);
			}

		}



		this.setLabelPosNode = function(node,label, counter)
		{
			var labelX,labelY,labelLength;
			var labelPosX,labelPosY,labelPos;
			var svgLabel,svgSquare,svgNode;
			var yOff = 0, xOff;
			var height, width;


			svgNode = node.svg;
			svgLabel = label.svg;
			svgSquare = label.labelRect;

			labelPosY = label.posY;
			labelPosX = label.posX;
			labelPos = labelPosY+":"+labelPosX;

			/**Set label position**/
			labelLength = svgLabel.getComputedTextLength();

			if (node.style.type === "circle")
			{
				height = svgNode.getAttributeNS(null,"r")*2;
				width = height;

			}
			else
			{
				height = svgNode.getAttributeNS(null,"height");
				width = svgNode.getAttributeNS(null,"width");
			}


			if (labelPosY === "bottom")
			{
				yOff = height/2+12+node.labelOffset*counter[labelPos];				
			}
			else if (labelPosY ==="top")
			{
				yOff = -height/2-5-node.labelOffset*counter[labelPos];				
			}
			else
			{
				yOff = 0;
			}

			if (labelPosX === "right")
			{
				xOff = width/2+5;				
			}
			else if (labelPosX ==="left")
			{
				xOff = -width/2-5-labelLength;				
			}	
			else
			{
				xOff = -labelLength/2;
			}

			svgLabel.setAttributeNS(null, "x", node.x +xOff);
			svgLabel.setAttributeNS(null, "y", node.y + yOff);		


			labelX = svgLabel.getAttributeNS(null, "x");
			labelY = svgLabel.getAttributeNS(null, "y");

			svgSquare.setAttributeNS(null, "x", labelX-2);					
			svgSquare.setAttributeNS(null, "y", labelY-10);
			svgSquare.setAttributeNS(null, "width", labelLength+4);

			counter[labelPos]++;					
		};



		this.setLabelPosLink = function(link,label, counter)
		{
			var labelX,labelY,labelLength;
			var labelPosX,labelPosY,labelPos;
			var svgLabel,svgSquare,svgLink;
			var yOff = 0, xOff = 0;

			var x1=0,x2=0,y1=0,y2=0,xCenter,yCenter;
			var width;

			svgLink = link.svg;
			svgLabel = label.svg;


			svgSquare = label.labelRect;

			x1 = svgLink.getAttributeNS(null,"x1");
			x2 = svgLink.getAttributeNS(null,"x2");
			y1 = svgLink.getAttributeNS(null,"y1");	
			y2 = svgLink.getAttributeNS(null,"y2");


			width = svgLink.getAttributeNS(null,"stroke-width");

			if (x1!==undefined && x2!==undefined && y1!==undefined && y2!==undefined)
			{

				xCenter = x1/2+x2/2;
				yCenter = y1/2+y2/2;

				labelPosY = label.posY;
				labelPosX = label.posX;
				labelPos = labelPosY+":"+labelPosX;

				///Set label position
				labelLength = svgLabel.getComputedTextLength();

				//Check if the link isnt vertical
				if ((x1-x2)!==0)
				{

				}

				xOff = -labelLength/2;
				if (labelPosY === "bottom")
				{
					yOff = 12+link.labelOffset*counter[labelPos]+width/2;				
				}
				else if (labelPosY ==="top")
				{
					yOff = -5-link.labelOffset*counter[labelPos]-width/2;				
				}
				else
				{
					yOff = 0;
				}				

				svgLabel.setAttributeNS(null, "x", xCenter+xOff);
				svgLabel.setAttributeNS(null, "y", yCenter+yOff);		


				labelX = svgLabel.getAttributeNS(null, "x");
				labelY = svgLabel.getAttributeNS(null, "y");

				svgSquare.setAttributeNS(null, "x", labelX-2);					
				svgSquare.setAttributeNS(null, "y", labelY-10);
				svgSquare.setAttributeNS(null, "width", labelLength+4);

				counter[labelPos]++;

			}
		};		

		this.setLabelPosBus = function(bus,label, counter)
		{
			var labelX,labelY,labelLength;
			var labelPosX,labelPosY,labelPos;
			var svgLabel,svgSquare,svgBus;
			var yOff = 0, xOff = 0;

			var x1=0,x2=0,y1=0,y2=0,xCenter,yCenter;
			var width;

			svgBus = bus.svg;
			svgLabel = label.svg;


			svgSquare = label.labelRect;

			x1 = svgBus.getAttributeNS(null,"x1");
			x2 = svgBus.getAttributeNS(null,"x2");
			y1 = svgBus.getAttributeNS(null,"y1");	
			y2 = svgBus.getAttributeNS(null,"y2");


			width = svgBus.getAttributeNS(null,"stroke-width");

			if (x1!==undefined && x2!==undefined && y1!==undefined && y2!==undefined)
			{

				xCenter = x1/2+x2/2+bus.dx;
				yCenter = y1/2+y2/2;

				labelPosY = label.posY;
				labelPosX = label.posX;
				labelPos = labelPosY+":"+labelPosX;

				///Set label position
				labelLength = svgLabel.getComputedTextLength();

				//Check if the bus isnt vertical
				if ((x1-x2)!==0)
				{

				}

				xOff = -labelLength/2;
				if (labelPosY === "bottom")
				{
					yCenter = Math.max(y1,y2)-bus.dy;
					yOff = 12+bus.labelOffset*counter[labelPos]+width/2;				
				}
				else if (labelPosY ==="top")
				{
					yCenter = Math.min(y1,y2)-bus.dy;					
					yOff = -5-bus.labelOffset*counter[labelPos]-width/2;				
				}
				else
				{
					yOff = 0;
				}				

				svgLabel.setAttributeNS(null, "x", xCenter+xOff);
				svgLabel.setAttributeNS(null, "y", yCenter+yOff);		


				labelX = svgLabel.getAttributeNS(null, "x");
				labelY = svgLabel.getAttributeNS(null, "y");

				svgSquare.setAttributeNS(null, "x", labelX-2);					
				svgSquare.setAttributeNS(null, "y", labelY-10);
				svgSquare.setAttributeNS(null, "width", labelLength+4);

				counter[labelPos]++;

			}
		};				







		//Set the style of the node by giving the name of the style
		this.setNodeStyleByName = function (id, styleName) {
			node = this.nodeList[id];
			if (node !== undefined) {
				if (tNetwork.styles.node[styleName] !== undefined) {
					node.style = tNetwork.styles.node[styleName];
				}
			}
		};


		this.setLinkStyleByName = function (edge_id, styleName) {
			var edge;
			edge = this.linkList[edge_id];
			if (edge !== undefined) {
				edge.svg.setAttributeNS(null, "class", styleName);
			}
		};

		this.setLinkStyleByNameTheOther = function (edge_id, styleNameOne, styleNameTwo) {
			var edge, actualStyle;
			edge = this.linkList[edge_id];
			if (edge !== undefined) {
				actualStyle = edge.svg.getAttributeNS(null, "class");
				if (actualStyle === styleNameOne){
					edge.svg.setAttributeNS(null, "class", styleNameTwo);
				}
				if (actualStyle === styleNameTwo){
					edge.svg.setAttributeNS(null, "class", styleNameOne);
				}
			}
		};

		//Add a default event Handler to the link
		this.setLinkEventHandler = function (event, handler) {
			this.defaultLinkHandlers[event] = handler;
		};

		this.setDefaultNodeEventHandler = function (event, handler) {
			this.defaultNodeHandlers[event] = handler;

		};

		this.addEventHandlerElement = function (node, ev, handler) {
			if (node.svg !== null) {

				node.svg.addEventListener(ev, handler , false);
				//node.svg.addEventListener("click",function(){alert('hello world!')},false);
			}
		};

		this.removeEventHandlerNode = function (node, ev, handler) {
			if (node !== undefined && node.svg !== undefined) {
				if (node === undefined || ev === undefined || handler === undefined)
					console.log(node);
				node.svg.removeEventListener(ev, handler , false);
			}
		};

		this.addArrowToDefs = function (arrowStyle, arrowName) {
			var marker, arrow, att;
			marker = document.createElementNS(this.svgNS, "marker");
			marker.setAttributeNS(null, "id", arrowName);
			for (att in arrowStyle.marker) {
				marker.setAttributeNS(null, att, arrowStyle.marker[att]);
			}
			arrow = document.createElementNS(this.svgNS, arrowStyle.type);
			for (att in arrowStyle.params) {
				arrow.setAttributeNS(null, att, arrowStyle.params[att]);
			}
			marker.appendChild(arrow);
			document.getElementById(this.defs_id).appendChild(marker);
		};



		this.getList = function(elementType)
		{
			return this.elements[elementType]["list"];
		}

		this.getType = function(element)
		{
			return element.elementType;
		}



		this.setElementPropertyById = function (id, propName, propValue) {
			var node, nodeSVG;
			node = nodeList[id];
			if (node != undefined) {
				nodeSVG = node.svg;
				if (nodeSVG != undefined) {
					nodeSVG.setAttributeNS(null,propName,propValue);
				}
			}
		};

		this.setElementProperty = function (node, propName, propValue) {
			var nodeSVG = node.svg;
			if (nodeSVG != undefined) {
				nodeSVG.setAttributeNS(null,propName,propValue);
				//myNode.setAttributeNS(null, "x", node.x - (node.style.params.width / 2));myNode.setAttributeNS(null, "x", node.x - (node.style.params.width / 2));
			}
		};

		/*this.setBusProperty = function (bus, propName, propValue) {
            var busSVG = bus.svg;
            if (busSVG != undefined) {
                nodeSVG.setAttributeNS(null,propName,propValue);
                //myNode.setAttributeNS(null, "x", node.x - (node.style.params.width / 2));myNode.setAttributeNS(null, "x", node.x - (node.style.params.width / 2));
            }
        };   */     


		this.selectSVGUp = function (evt) {
			if (that.selectedElement !== 0){
				that.deselectElementUp(evt);
			}
			that.movingWorld = 0;
		};

		this.movingWorld=0;
		this.movingWorldX=0;
		this.movingWorldY=0;
		this.currentMatrixWorld=[];

		this.selectSVGDown = function (evt) {
			var i;
			evt.preventDefault();
			if (that.selectedElement === 0){
				that.movingWorld = true;
				that.movingWorldX = evt.x;
				that.movingWorldY = evt.y;
			}
			if ($("#"+that.svg_id +" g").attr("transform") === undefined){
				for(i=0;i<6;i++){
					that.currentMatrixWorld[i]=0;
				}
				that.currentMatrixWorld[0]=1;
				that.currentMatrixWorld[3]=1;
			}else{
				that.currentMatrixWorld =$("#"+that.svg_id +" g").attr("transform").slice(7,-1).split(' ');;
				for(var i=0; i<that.currentMatrixWorld.length; i++) {
					that.currentMatrixWorld[i] = parseFloat(that.currentMatrixWorld[i]);
				}
			}
		};
		this.selectSVGOut = function (evt) {
			that.movingWorld = 0;
		};

		this.selectSVGMove = function (evt) {
			var dx,dy,newMatrix;
			if ((that.selectedElement !== 0)&&(that.eventProcessed === 0)){
				//We are out of the element because we were moving too fast
				that.moveElement(evt);
			}else if (that.movingWorld === true){
				dx = evt.clientX - that.movingWorldX;
				dy = evt.clientY - that.movingWorldY;
				dx = dx;
				dy = dy;
				that.currentMatrixWorld[4] += dx;
				that.currentMatrixWorld[5] += dy;
				that.movingWorldX = evt.x;
				that.movingWorldY = evt.y;
				newMatrix = "matrix(" + that.currentMatrixWorld.join(' ') + ")";

				$("#"+that.svg_id +" g").attr("transform", newMatrix);
				$("#"+"backgroundImg").attr("transform", newMatrix);
			}
			that.eventProcessed = 0;
		};


		
		this.myMultiMatrix= function(m1,m2){
			var i, j, k,result=[];
			for(i = 0; i < 9; i++){
				result[i] = 0;
			}
		    for(i = 0; i < 3; i++)
		    {
		            for(j = 0; j < 3; j++)
		            {
		                    for(k = 0; k < 3; k++)
		                    {
		                            result[i*3+j] +=  m1[i*3+k] *  m2[k*3+j];
		                            //console.log("result["+(i*3+j)+"] "+result[i*3+j]);
		                    }
		            }
		    }
		    return result;
		}
		
		
		
		this.scrolling = function (evt){
		var el,actualNode,flag = 1,sum,xNode,yNode,node,alreadyChanged,transform;
		alreadyChanged = [];
		
		/*
		if ((navigator.userAgent.indexOf('Firefox'))){
			evt.x = evt.pageX;
			evt.y = evt.pageY;
		}
		*/
		
		
		if(evt.altKey){
			//zoom out
			if (evt.wheelDelta>0){
				sum = +4;
			}else {
				sum = -4;
			}
		    for (node in this.nodeList) {
		    	actualNode = this.nodeList[node];
	            if (actualNode.style.type === "image"){
	            	if ((actualNode.style.params.height + sum < 5)&&(alreadyChanged[actualNode.style.id]===undefined)){
	            		evt.preventDefault();
	            		return;
	            	}
	            	
	            	if (alreadyChanged[actualNode.style.id]===undefined){
	            		actualNode.style.params.height = actualNode.style.params.height + sum;
	            		actualNode.style.params.width = actualNode.style.params.width + sum;
	            		alreadyChanged[actualNode.style.id]=1;
	            	}
	            	
	            }
	            else{
	            	throw "Only image type is supported";
	            }
	            
	            if (this.nodeList.hasOwnProperty(node)) {
	                el = document.getElementById(actualNode.node_id);
	                el.setAttribute('height',actualNode.style.params.height);
	                el.setAttribute('width',actualNode.style.params.width);
	            }
	            xNode = parseInt(actualNode.svg.getAttributeNS(null,"x"));
	            yNode = parseInt(actualNode.svg.getAttributeNS(null,"y"));
	            actualNode.svg.setAttributeNS(null, "x", xNode - (sum / 2));
	            actualNode.svg.setAttributeNS(null, "y", yNode - (sum / 2));
	            
	        }	
		}else{
			var translateFirst=[], translateSecond=[], scaleMiddle=[], i, zoom, interMatrix1=[], interMatrix2=[],finalMatrix=[]; 
			var transMatrix,trMatrix=[],finalMatrixString;				
			if (evt.wheelDelta>0){
				this.zoom = this.zoom*1.05;
				zoom = 1.05;
			}else{
				this.zoom = this.zoom/1.05;
				zoom = 1/1.05;
			}
			
			transform = $("#"+that.svg_id +" g").attr("transform");		
			if (transform === undefined){
				trMatrix[0] = 1;
				trMatrix[1] = 0;
				trMatrix[2] = 0;
				trMatrix[3] = 0;
				trMatrix[4] = 1;
				trMatrix[5] = 0;
				trMatrix[6] = 0;
				trMatrix[7] = 0;
				trMatrix[8] = 1;
			}
			else{
				transMatrix = transform.slice(7,-1).split(' ');

				
	      		trMatrix[0] = parseFloat(transMatrix[0]);
	      		trMatrix[1] = parseFloat(transMatrix[2]);
	      		trMatrix[2] = parseFloat(transMatrix[4]);
	      		trMatrix[3] = parseFloat(transMatrix[1]);
	      		trMatrix[4] = parseFloat(transMatrix[3]);
	      		trMatrix[5] = parseFloat(transMatrix[5]);
	      		
	      		trMatrix[6] = 0;
	      		trMatrix[7] = 0;
	      		trMatrix[8] = 1;
	      	}
	  		
	    	for (i = 0; i < 8;i++){
	    		translateFirst[i]  = 0;
	    		translateSecond[i]  = 0;
	    		scaleMiddle[i]  = 0;
	    	}
	    	translateFirst[0] = 1;
	    	translateFirst[4] = 1;
	    	translateFirst[8] = 1;
	    	translateFirst[2] = -evt.x;
	    	translateFirst[5] = -evt.y;
	    	
	    	translateSecond[0] = 1;
	    	translateSecond[4] = 1;
	    	translateSecond[8] = 1;
	    	translateSecond[2] = evt.x;
	    	translateSecond[5] = evt.y;

			scaleMiddle[8] = 1;
			scaleMiddle[0] = zoom;
			scaleMiddle[4] = zoom;
			
			
			interMatrix1 = that.myMultiMatrix(translateSecond,scaleMiddle);
			interMatrix2 = that.myMultiMatrix(translateFirst,trMatrix);
			
			finalMatrix = that.myMultiMatrix(interMatrix1,interMatrix2);
			//console.log("nexMatrix("+finalMatrix[0]+" "+finalMatrix[1]+" "+finalMatrix[2]+" "+finalMatrix[3]+" "+finalMatrix[4]+" "+finalMatrix[5]+" "+finalMatrix[6]+" "+finalMatrix[7]+" "+finalMatrix[8]+")");
			finalMatrixString = "matrix("+finalMatrix[0]+" "+finalMatrix[3]+" "+finalMatrix[1]+" "+finalMatrix[4]+" "+finalMatrix[2]+" "+finalMatrix[5]+")"
			
			
			//Sabe dios por que las lineas de abajo dan error en jquery en firefox
			$("#"+that.svg_id +" g").attr("transform",finalMatrixString);
			
		}
		that.reDrawLinks(that.linkList);
		console.log("Wheeling!");
		evt.preventDefault();
	}
		
		




		this.reDrawLinks = function (relinks){
			var oldSVGLink,oldLink,src,dst,link;
			for (link in relinks) {
				oldSVGLink = relinks[link].svg;
				oldLink = relinks[link];

				src = {};
				dst = {};
				tNetwork.crossingOutPoint(oldLink.src.style, oldLink.src.x, oldLink.src.y, oldLink.dst.x , oldLink.dst.y , oldLink.style.offset, src);
				tNetwork.crossingOutPoint(oldLink.dst.style, oldLink.dst.x, oldLink.dst.y , oldLink.src.x, oldLink.src.y, -1 * oldLink.style.offset, dst);

				oldSVGLink.setAttributeNS(null, "x1", oldLink.src.x + src.x);
				oldSVGLink.setAttributeNS(null, "y1", oldLink.src.y + src.y);
				oldSVGLink.setAttributeNS(null, "x2", oldLink.dst.x + dst.x);
				oldSVGLink.setAttributeNS(null, "y2", oldLink.dst.y + dst.y);
				oldSVGLink.setAttributeNS(null, "id", oldLink.src.id + ":" + oldLink.dst.id);	

				this.setLabelsPos(oldLink);
			}
		};


		this.reDrawBuses = function (rebuses)
		{
			var bus,b,svg;
			var position = {"top":0,"bottom":0};

			for (b in rebuses) if(rebuses[b].show === true)
			{
				this.setBusPosition(rebuses[b]);
				this.setLabelsPos(rebuses[b]);
			}
		};

		this.setBusPosition = function(bus)
		{
			var b,svg;
			var y1,y2;
			var position; //= {"top":0,"bottom":0};

			svg = bus.svg;



			position = {"top":0,"bottom":0};

			this.calculateBusPosition(bus, position);



			svg.setAttributeNS(null, "y1", position.bottom+bus.dy);
			svg.setAttributeNS(null, "y2",position.top+bus.dy);			

		}

		this.calculateBusPosition = function(bus,position)
		{

			var bl, busLink,svgLink,busLinkh;
			var minh = 100000;
			var maxh = -100000;

			for (bl in  that.busLinkList) if (that.busLinkList[bl].show===true)
			{
				busLink = that.busLinkList[bl];
				if (busLink.bus.style.id !== undefined && busLink.bus.style.id === bus.style.id)
				{
					svgLink = busLink.svg;
					busLinkh = svgLink.getAttributeNS(null, "y1");

					minh = Math.min(minh,busLinkh);
					maxh = Math.max(maxh,busLinkh);
				}

			}
			if (minh != 100000)
				position.bottom=minh;//svg.setAttributeNS(null, "y1", minh);
			if (maxh != -100000)
			{
				if ((maxh-minh) < bus.style.min_height)
					position.top=minh+bus.style.min_height;//svg.setAttributeNS(null, "y2", minh+bus.style.min_height);
				else
					position.top=maxh;//svg.setAttributeNS(null, "y2", maxh);
			}			


		};




		this.reDrawBusLinks = function (busLinks){
			var svgLink,busLink,src,bl,busAux,svgBus;
			for (bl in busLinks) if (busLinks[bl].show === true) {
				svgLink = busLinks[bl].svg;
				busLink = busLinks[bl];

				busAux = that.busList[busLink.bus.style.id];
				svgBus = busAux.svg;


				src = {};
				tNetwork.crossingOutPoint(busLink.node.style, busLink.node.x, busLink.node.y, busLink.bus.x, busLink.node.y, 0, src);           
				//svgLink.setAttributeNS(null, "style","stroke:rgb(255,0,0);stroke-width:2");  
				svgLink.setAttributeNS(null, "x1", busLink.node.x + src.x);
				svgLink.setAttributeNS(null, "y1", busLink.node.y+src.y);
				svgLink.setAttributeNS(null, "x2", busLink.bus.x);
				svgLink.setAttributeNS(null, "y2", busLink.node.y+src.y);
				svgLink.setAttributeNS(null, "id", busLink.id);


				/**Miramos si algun bus deberia medir mas**/
				//busAux = bus
				this.setLabelsPos(busLink);
			}
		}


		this.changeElementVisibility = function(show,id,type,element)
		{
			var list, elementType="", changedElement="";
			var el="";
			if (element === undefined)
			{
				//We only have the id
				if (type === undefined)
				{
					for (elementType in this.elements)
					{
						list = this.getList(elementType);//this.elements[elementType]["list"];
						if (list[id]!== undefined)
						{
							changedElement = list[id];
							list[id].show = show;
						}
					}
				}
				else
				{
					list = this.getList(type);
					if (list[id]!== undefined)
					{
						changedElement = list[id];
						list[id].show = show;
					}
				}
			}
			else
			{
				changedElement = element;
				element.show = show;				
			}


			//We have to see if this change affects to some other element
			if (changedElement !=="")
			{
				if (changedElement.elementType ==="node")
				{
					list = this.getList("link");
					for (el in list)
					{

						if (list[el].src.id === changedElement.id || list[el].dst.id === changedElement.id)
						{
							list[el].show = show;
						}
					}
					list = this.getList("buslink");
					for (el in list)
					{
						if (list[el].node.id === changedElement.id)
						{
							list[el].show = show;
						}
					}					

				}
				if (changedElement.elementType ==="bus")
				{
					list = this.getList("buslink");
					for (el in list)
					{
						if (list[el].bus.id === changedElement.id)
						{
							list[el].show = show;
						}
					}						
				}			
				//this.drawNetwork();
			}
		};



		this.moveElement = function (evt) {
			var dx, dy, newMatrix,link,oldSVGLink,oldLink,src,dst, movingNode=0,label_id,node;
			var bus, movingBus=0;

			//Mirar por que hay que poner esto
			if(that.selectedElement === 0){
				console.log("Trying to access unselected element");
				return;
			}

			dx = evt.clientX - that.currentX;
			dy = evt.clientY - that.currentY;
			dx = dx/that.zoom;
			dy = dy/that.zoom;
			that.currentMatrix[4] += dx;
			that.currentMatrix[5] += dy;
			newMatrix = "matrix(" + that.currentMatrix.join(' ') + ")";

			that.selectedElement.setAttributeNS(null, "transform", newMatrix);
			that.currentX = evt.clientX;
			that.currentY = evt.clientY;

			that.eventProcessed = 1;


			for (node in that.nodeList){

				if (node === that.selectedElement.id){
					movingNode = that.nodeList[node];
				}
			}
			for (bus in that.busList){

				if (bus === that.selectedElement.id){
					movingBus = that.busList[bus];
				}
			}
			if (movingBus!==0)
			{
				movingBus.x +=dx;
				movingBus.dy -=dy;
				movingBus.dx +=dx;


			}else if (movingNode !==0)
			{
				movingNode.x += dx;
				movingNode.y += dy;
				this.setHighlightPos(movingNode);
				this.setLabelsPos(movingNode);
			}







			that.reDrawLinks(that.selectedLinkList);
			that.reDrawBusLinks(that.selectedBusLinkList);
			that.reDrawBuses(that.selectedBusList);
		};

	
		
		
		
		

		this.toggleHighlight = function (element_type,element_id,show) {
			var e = this.elements[element_type]["list"];
			var element = e[element_id];

			if (element !=undefined)
			{
				if (element_type === "bus")
				{
					this.toggleHighlightBus(element_id, show);
				}
				else if(element_type ==="link")
				{
					this.toggleHighlightLine(element.src.id, element.dst.id, show);
				}
				else if(element_type ==="buslink")
				{
					this.toggleHighlightLine(element.bus.id, element.node.id, show);
				}
				else if (element_type === "node" && element.highlight !== undefined)
				{
					if (show !== undefined)
						element.highlight.show = show;
					else element.highlight.show = !element.highlight.show;
				}
			}
		};

		this.setHighlightPos = function (node) {
			var svgNode = node.svg, svgHighlight;
			var transform;

			if (svgNode !== undefined)
			{
				if (node.highlight !== undefined && node.highlight.svg !== undefined && node.highlight.show)
				{

					svgHighlight = node.highlight.svg;
					transform = svgNode.getAttributeNS(null,"transform");
					svgHighlight.setAttributeNS(null,"transform",transform);
				}
			}

		};



		this.selectElement = function (evt) {


			var link,busLink,bus;
			that.selectedLinkList = [];
			that.mouseDown++;
			that.selectedElement = evt.target;
			that.currentX = evt.clientX;
			that.currentY = evt.clientY;
			that.currentMatrix = that.selectedElement.getAttributeNS(null, "transform").slice(7,-1).split(' ');
			for(var i=0; i<that.currentMatrix.length; i++) {
				that.currentMatrix[i] = parseFloat(that.currentMatrix[i]);
			}
			//node.svg.addEventListener(ev, handler , false);


			/*for (link in that.linkList) {
		    	console.log("Link++ :: "+link+","+that.linkList);
		    }*/
			if (that.busList[evt.target.id] !== undefined)
			{

				for (busLink in that.busLinkList) {
					if ((that.busLinkList.hasOwnProperty(busLink)) &&(that.busLinkList[busLink].bus.style.id === evt.target.id))
					{	
						that.selectedBusLinkList[busLink] = that.busLinkList[busLink];
					}
				}
				that.selectedBusList[evt.target.id] = that.busList[evt.target.id];

			}


			for (busLink in that.busLinkList) {
				if ((that.busLinkList.hasOwnProperty(busLink)) &&(that.busLinkList[busLink].node.id === evt.target.id)){
					that.selectedBusLinkList[busLink] = that.busLinkList[busLink]; 


					/***BUSES THAT ARE AFFECTED**/
					bus = that.busLinkList[busLink].bus.style.id;
					that.selectedBusList[bus] = that.busList[bus];
				}
			}


			for (link in that.linkList) {
				if ((that.linkList.hasOwnProperty(link)) &&(that.linkList[link].src.id === evt.target.id) || (that.linkList[link].dst.id === evt.target.id)){
					that.selectedLinkList[link] = that.linkList[link]; 
				}
			}
			//that.selectedElement.setAttributeNS(null,"onmousemove", "that.moveElement(evt)");
			//that.selectedElement.setAttributeNS(null, "onmouseout", "that.deselectElementOut(evt)");
			//that.selectedElement.setAttributeNS(null, "onmouseup", "that.deselectElementUp(evt)");

		};

		this.deselectElementUp = function (evt) {
			that.mouseDown--;
			if(that.selectedElement !== 0){
				that.selectedElement.removeAttributeNS(null, "onmousemove");
				that.selectedElement.removeAttributeNS(null, "onmouseout");
				that.selectedElement.removeAttributeNS(null, "onmouseup");
				that.selectedElement = 0;
			}
		};

		this.deselectElementOut = function (evt) {
			if (that.mouseDown){}
			else if(that.selectedElement != 0){
				that.selectedElement.removeAttributeNS(null, "onmousemove");
				that.selectedElement.removeAttributeNS(null, "onmouseout");
				that.selectedElement.removeAttributeNS(null, "onmouseup");
				that.selectedElement = 0;
			}
		};




		/*** Needed for the indexation of the elements,
		 *   it must be put here in order to define the functions
		 */
		this.elements = {
				"layer": {
					"list":this.layerList,
					"draw":this.drawLayer,
				},
				"buslink" : {
					"list":this.busLinkList,
					"draw":this.drawBusLink,
					"setlabel":this.setLabelPosLink,
					"labelposx":"center",
					"labelposy":"top",
				},
				"bus" : {
					"list":this.busList,
					"draw":this.drawBus,	
					"setlabel":this.setLabelPosBus,
					"labelposx":"center",
					"labelposy":"top",
				},
				"link": {
					"list":this.linkList,
					"draw":this.drawLink,
					"setlabel":this.setLabelPosLink,
					"labelposx":"center",
					"labelposy":"top",
				},
				"node": {
					"list":this.nodeList,
					"draw":this.drawNode,
					"setlabel":this.setLabelPosNode,
					"labelposx":"center",
					"labelposy":"bottom",
				},




		};				

	};



	tNetwork.Network.prototype = {
			svgNS: "http://www.w3.org/2000/svg",
			xlinkNS: "http://www.w3.org/1999/xlink",  // =>//Namespace of XLINK
			defaultNodeClass: "roadm",
			defaultLinkClass: "fiberLink",
			defaultLinkHandlers: [],
			defaultNodeHandlers: [],
			net: undefined,
			editMode: false
	};

	tNetwork.crossingOutPoint = function (element, x1, y1, x2, y2, offset, point) {
		var a, b, c, tan, cos, sin, x, y, soly1, soly2;
		var lineDirX,lineDirY,pX,pY, ortLineDirX, ortLineDirY, NormOrtLineDir,tAux,sAux,ang1,ang2,ang3,ang4,rectAng;
		x = x2 - x1;
		y = y2 - y1;            
		tan = y / x;
		if (element.anchPoint != undefined ) {

		} else if (element.type === "image"){
			if ((offset > element.params.height/2)||(offset > element.params.width/2)){
				console.log("Offset is too big and the edge will be outside of the image");
			}
			else{

				lineDirX = x2 - x1;
				lineDirY = y2 - y1;
				ortLineDirX = lineDirY;
				ortLineDirY = -lineDirX;
				NormOrtLineDir = Math.sqrt(ortLineDirX * ortLineDirX + ortLineDirY * ortLineDirY);
				ortLineDirX = ortLineDirX/NormOrtLineDir;
				ortLineDirY = ortLineDirY/NormOrtLineDir;

				pX = x1 + ortLineDirX * offset;
				pY = y1 + ortLineDirY * offset;


				//We have to see what side of the rect is cut by our line. This is done
				//to determine that side

				ang1 = Math.atan((pY - (y1 - element.params.height/2))/(x1+element.params.width/2-pX));
				ang2 = Math.PI - Math.atan((pY - (y1 - element.params.height/2))/(pX - (x1 - element.params.width/2)));
				ang3 = Math.PI + Math.atan(((y1 + element.params.height/2) - pY)/(pX - (x1 - element.params.width/2)));
				ang4 = 2*Math.PI - Math.atan(((y1 + element.params.height/2) - pY)/(x1+element.params.width/2-pX));


				//arcosine of scalar product (lineDirX,lineDirY) * (1,0) /|(lineDirX,lineDirY)|
				rectAng = Math.acos(lineDirX/Math.sqrt(lineDirX * lineDirX + lineDirY * lineDirY));
				if (lineDirY>0){
					rectAng = 2*Math.PI - rectAng;
				}


				if ((rectAng<=ang1)||(rectAng>=ang4)){	

					tAux = (x1 + element.params.width/2 - pX)/lineDirX;
					sAux = pY + tAux*lineDirY - y1;

					point.x = element.params.width/2;
					point.y = sAux;
				}
				else if ((ang1<rectAng)&&(rectAng<=ang2)){
					tAux = (y1 - element.params.height/2 - pY)/lineDirY;
					sAux = pX + tAux*lineDirX - x1;

					point.x = sAux;
					point.y = -element.params.height/2;
				}
				else if ((ang2<rectAng)&&(rectAng<=ang3)){	    		
					tAux = (x1 - element.params.width/2 - pX)/lineDirX;
					sAux = pY + tAux*lineDirY - y1;

					point.x = -element.params.width/2;
					point.y = sAux;
				}
				else if ((ang3<rectAng)&&(rectAng<ang4)){
					tAux = (y1 + element.params.height/2 - pY)/lineDirY;
					sAux = pX + tAux*lineDirX - x1;

					point.x = sAux;
					point.y = element.params.height/2;
				}
			}
			//point.x = 0;
			//point.y = 0;

		}
		else if (element.type === "circle"){
			if (tan === Infinity) {
				point.x = offset;
				point.y = Math.sqrt((element.params.r * element.params.r) -(offset * offset));
			} else if (tan === -Infinity) {
				point.x = -1 * offset;
				point.y = -1*Math.sqrt((element.params.r * element.params.r) -(offset * offset));
			}
			else if (tan == 0) {
				point.y = -1 * tNetwork.sign(x) * offset;
				point.x = tNetwork.sign(x) * Math.sqrt((element.params.r * element.params.r) -(offset * offset));
			} else {
				cos = Math.cos(Math.atan(tan));
				if (tNetwork.sign(x) === 1) {
					if (tNetwork.sign(cos) != 1){
						cos= -1*cos;
					}
				} else {
					if (tNetwork.sign(cos) != -1) {
						cos = -1 * cos;
					}
				}
				sin = Math.sin(Math.atan(tan));
				if (tNetwork.sign(y) === 1) {
					if (tNetwork.sign(sin) != 1){
						sin= -1*sin;
					}
				} else {
					if (tNetwork.sign(sin) != -1) {
						sin = -1 * sin;
					}
				}                    
				a = 1 + (tan * tan);
				b = 2 * offset / cos;
				c = (offset * offset / (cos * cos) )- (tan * tan * element.params.r * element.params.r);
				soly1 = (-b + Math.sqrt( (b * b) - (4*a*c) ))/ (2 * a);
				soly2 = (-b - Math.sqrt( (b * b) - (4*a*c) ))/ (2 * a);  
				if ( tNetwork.sign(sin) === 1){
					if (soly1 > soly2) {
						point.y = soly1;
					} else {
						point.y = soly2;
					}
				}else {
					if (soly1 < soly2) {
						point.y = soly1;
					} else {
						point.y = soly2;
					}
				}
				point.x = ( point.y + (offset / cos) ) / tan;
			}
		}
	};


	tNetwork.sign = function (x) {
		return x > 0 ? 1 : x < 0 ? -1 : 0;
	};



	/**
@function sets the attributes of a svgObject.
@ svgObject SVG object where the attributes are applied
@ attributes Object containing parameter-value pairs to add to the svgObject
	 */
	tNetwork.setSVGAttributes = function (svgObject, attributes){
		var att;
		for (att in attributes) {
			//console.log("Param es : "+att+","+ attributes[att]);
			//console.log("svgObject "+svgObject);
			svgObject.setAttributeNS(null, att, attributes[att]);
		}
	};





	tNetwork.NetworkLink.prototype={
			bidirectional: false
	};

	tNetwork.NetworkNode.prototype = {
			showLabel: true
	};


	tNetwork.styles={};

	tNetwork.styles.matrix={
			transform: "matrix(1 0 0 1 0 0)"				
	};

	tNetwork.styles.node={
			defaultNode: {
				id: "defaultNode",
				type: "circle",
				params: {
					'class': "defaultNode",
					r: 30,
					transform: "matrix(1 0 0 1 0 0)"
				},
				xLabelOffset: -50,
				yLabelOffset: 50
			},


			defaultCircle: {
				id: "defaultCircle",
				type: "circle",
				params: {
					'class': "defaultNode",
					r: 30,
					"fill-opacity" : 0.1,
					fill : "blue",
					stroke : "blue",
					"stroke-width" : 2,
					transform: "matrix(1 0 0 1 0 0)"
				},
				xLabelOffset: -50,
				yLabelOffset: 50				



			},

			defaultHighlight: {
				id: "defaultHighlight",
				type: "circle",
				params: {
					'class': "defaultNode",
					r: 30,
					"fill-opacity" : 1,
					fill : "#E6E6FF",
					stroke : "#0061b0",
					"stroke-width" : 2,
					transform: "matrix(1 0 0 1 0 0)"
				},
				xLabelOffset: -50,
				yLabelOffset: 50				



			},

			defaultHighlightCircle: {
				id: "defaultHighlight",
				type: "circle",
				params: {
					'class': "defaultNode",
					r: 35,
					"fill-opacity" : 1,
					fill : "#E6E6FF",
					stroke : "#0061b0",
					"stroke-width" : 2,
					transform: "matrix(1 0 0 1 0 0)"
				},
				xLabelOffset: -50,
				yLabelOffset: 50				



			},

			defaultNode2: {
				id: "defaultNode2",
				type: "img",
				params: {
					'class': "circleNode",
					href: "../img/router.png",
					height: 70,
					width: 70,
					transform: "matrix(1 0 0 1 0 0)"
				},
				xLabelOffset: -50,
				yLabelOffset: 50,

			}


	};

	tNetwork.styles.link = {
			defaultUnidirectionalLink: {
				type: "line",
				params: {
					'class': "defaultUnidirectionalLink",
					'marker-end': "url(#upperHalfArrow)",					
					"stroke-width": 2,
					"cursor": "pointer",
				},
				offset: 2
			},

			defaultBidirectionalLink: {
				type: "line",
				params: {
					'class': "defaultUnidirectionalLink",		
					"stroke-width": 2,
					"cursor": "pointer",					
				},
				offset: 0
			}
	};

	tNetwork.styles.arrow = {
			triangleArrow: {
				marker: {
					viewBox: "0 0 30 30",
					refX: "27",
					refY: "15",
					orient: "auto",
					markerHeight: "30",
					markerWidth: "5",
					markerUnits: "strokeWidth",
					id: "triangleArrow"
				},
				type: "path",
				params: {
					d: "M 0 0 L 15 15 L 0 15 z",
					stroke: "black",
					fill: "black"
				}
			},
			upperHalfArrow: {
				marker: {
					viewBox: "0 0 15 7",
					refX: "15",
					refY: "7",
					orient: "auto",
					markerHeight: "30",
					markerWidth: "5",
					markerUnits: "strokeWidth",
					id: "upperHalfArrow"
				},
				type: "path",
				params: {
					d: "M 0 0 L 15 7 L 0 7 z",
					stroke: "black",
					fill: "black",
					id: "upperHalfArrowPath" 
				}
			}
	};

	tNetwork.styles.labelRect = {
			type: "rect",
			xoffset: "3",
			yoffset: "3",
			params:
			{
				rx: "3",
				ry: "3",
				transform: "matrix(1 0 0 1 0 0)",			
				height: "13",
				fill: "white",
				stroke: "black",
				'stroke-width': "1",
				opacity: "0.7"	
			}
	};

	tNetwork.styles.bus= {
			defaultBus : {
				type: "line",

				params: 
				{
					"class": "def",
					transform: "matrix(1 0 0 1 0 0)",
					'stroke-width': "7",
					"stroke-linecap":"round", 
					stroke:"#000000",
				}
			},



			bus1: {
				type: "line",
				params: 
				{
					transform: "matrix(1 0 0 1 0 0)",
					'stroke-width': "7",
					"stroke-linecap":"round", 
					stroke:"orange",
				}
			},

			bus2 : {
				type: "line",
				params: 
				{
					transform: "matrix(1 0 0 1 0 0)",
					'stroke-width': "7",
					"stroke-linecap":"round", 
					stroke:"green",
				}
			},

			bus3 : {
				type: "line",
				params: 
				{
					transform: "matrix(1 0 0 1 0 0)",
					'stroke-width': "7",
					"stroke-linecap":"round", 
					stroke: "#0029A3",
				}
			},

			bus4 : {
				type: "line",
				params: 
				{
					transform: "matrix(1 0 0 1 0 0)",
					'stroke-width': "7",
					"stroke-linecap":"round", 
					stroke: "#660000",
				}
			},			


			"bus2:bus1" : {
				type: "line",
				params: 
				{
					transform: "matrix(1 0 0 1 0 0)",
					'stroke-width': "6",
					"stroke-linecap":"round", 
					stroke:"#6600CC",
				}
			},

			"bus1:bus2" : {
				type: "line",
				params: 
				{
					transform: "matrix(1 0 0 1 0 0)",
					'stroke-width': "6",
					"stroke-linecap":"round", 
					stroke:"#6600CC",
				}
			},



	};





	tNetwork.Defaults = {

	};


} ) ();




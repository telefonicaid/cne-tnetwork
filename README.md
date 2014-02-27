tNetwork
==============

True Network Library: Javascript library to create and draw network graphs. It is SVG based and HTML 5 compatible.



###1-QuickStart

What your page should have to start working with tNetwork:

 ```html
<html>
<head>
<script type="text/javascript"
	src="http://code.jquery.com/jquery-latest.min.js"></script>
<link href="yourtnetworkpath/css/tNetwork.css" rel="stylesheet" type="text/css" />
<script src="yourtnetwork/js/tNetwork.js" type="text/javascript"></script>
</head>

	<body onload="mainLoad();">
	</body>
</html>
<script type="text/javascript">
var net;

function mainLoad()
{
  net=new tNetwork.Network();
  <!--Insert code here -->	  
}
</script>
```
	
####Creating a new network:

```java
net=new tNetwork.Network();
```
	  
####Drawing the network:

In order to see the net you created, you have to call this method:

```java
this.drawNetwork = function ();
```	

Assuming you called net to your network: 

```java
net.drawNetwork();
```

###2-Network elements:

You can create up to 5 different type of elements on the network:

	* nodes
	* links
	* buses
	* buslinks
	* layers.

####Creating a node: 

```java
this.addNode = function (id, x, y,href,nodeStyle,properties,label_text)
```
To create a basic node you need an ID and an absolute position:

```java
net.addNode(id,xPos,yPos);
```
	
Add a node with an image associated:

```java
net.addNode(id,xPos,yPos,href);
```	

Add a node with an image associated and a specific size:

```java
net.addNode(id,xPos,yPos,href,{width:100,height:100});	
```	

Add a node with properties that are displayed  when you hover the mouse over the node:

```java
net.addNode(id,xPos,yPos,"","",{p1:"address=192.168.1.1",p2:"id = node1"});
```	

Add a node directly with a label:

```java
net.addNode(id,xPos,yPos,"","","",label_text);
```	

####Creating a layer:

```java
this.addLayer = function (layer_id,height,y,fill,properties)
```

A layer is basically a huge rectangle. It is used to  delineate parts of the network.

The basic use:

```java
net.addLayer(id,height,yPos)
```	

If you want the layer to have a certain fill colour and properties

```java
net.addLayer(id,height,yPos,"####BBBBBB",{p1:"subnet layer",p2:"represents the subnet"});
```
	
####Creating a link:

```java
this.addLink = function (source, destination, bidirectional,style,properties,label_text)
```

Once you have at least two nodes, you can create a basic link between them.

```java
net.addLink(idSourceNode,idDestNode);
```
	
If you don't want the link to end with an arrow:

```java
net.addLink(idSourceNode,idDestNode,true);	
```

Adding a link with a specific width and/or color:

```java
net.addLink(idSourceNode,idDestNode,"",{color:"FFFFFF",width:20});
```
	
####Creating a bus:

```java
this.addVerticalBus = function (bus_id,x,min_height,style,properties,label_text)
```

If you want to create a bus with linked nodes, you need to create a bus first.

Create a basic bus:

```java
net.addBus(bus_id,xPos);
```

then create the links:

```java
net.addBusLink(bus_id,node_id);
```	

######Options:

Create a bus with a minimum height, even if its nodes are aligned

```java
net.addBus(bus_id,xPos,min_height);
```	

Create a bus with a specific color and/or width:

```java
net.addBus(bus_id,xPos,"",{color:"####f15501",width:20});
```
	
####Creating a busLink

```java
this.addBusLink = function (bus, node,properties,label_text)
```
	
BusLinks are specific links between a bus and a node. Tha basic busLink creation:

```java
net.addBusLink(bus_id,node_id);
```
	
BusLinks take the color properties from its associated bus.

####Accesing to network elements.

There is a structure called "elements" to access all the elements of the network.
Here are some examples to understand this structure better:

	1. Getting a specific element:

```java
net.elements[element_type]["list"][element_id];
```

	2. Getting all the nodes of the network:
```java
for (nodeId in net.elements["node"]["list"])
		node = net.elements["node"]["list"][nodeId];
```
	
	3. Getting all the elements of the network:

```java
for (type in net.elements)
		for(elementId in net.elements[type]["list"])
			element = net.elements[type]["list"][elementId];
```			

###3-Labels
		
####Adding labels

The following elements allow adding labels: 

	* node
	* link
	* bus
	* buslink
	
The method to add a label is:

```java
this.addLabel = function (type,id,label_text,posX,posY,showOption) 
```
	
	* type is the type of the element: "node", "link"...
	* posX can be: right, center, left
	* posY can be: top, center, bottom
	* showOption is set to false if you simply want to add the label without showing it
	
You can add multiple labels to a single element. Each element has its default label position,
in case you don't want to fill that fields. Minimum fields required are type, id and label_text.
	
######Examples:
	
```java
net.addLabel("bus","BUS1","this is a bus");
net.addLabel("node","N134","pNode","left","center");
```
	
####Clearing labels

```java
this.clearLabels = function(type,id)
```
	
####Getting the text of a label

```java
this.getLabelText = function(type,id,pos)
``` 
Pos depends on the order you added the labels, i.e pos=0 is the first label, pos1 the second one etc..


###4-Highlight
####Highlighting an element.

You can enable the highlight of some elements by calling the following methods:

```java
this.toggleHighlight = function (element_type,element_id,show);
```
	
If show option isn't defined (true or false), this method toggles automatically
the highlight of the element.

*__NOTE:__ if you want to apply the highlight to a node, you must redraw the network by calling net.drawNetwork();.*

So, for now, the order to highlight would be: 

1. Highlight desired nodes
2. Draw network
3. Highlight other elements
	
####Setting a custom highlight to a node.

By default, the highlight of a node is a blue circle surrounding it. You can change
this highlight using the following method:

```java
this.addHighlight = function(element_id,style)
```
	
Where style must have the same fields as this example:
	
```java
var customStyle = {
			type: "rect",
			params:
			{
				transform: "matrix(1 0 0 1 0 0)",			
				height: "78",
				width: "76",
				stroke: "red",
				'stroke-width': "12",
			}     
	};
```


###5-Edition:

####Network edit mode.

This methods are used to start or stop the network edit mode:

```java
this.startEditMode = function ();
	this.stopEditMode = function ();
```

When your network is in edit mode, you can perform the following actions:
	
1. Move the network nodes and buses through its container by clicking on them and dragging,
2. Move the entire network by clicking inside the container and moving the mouse
3. Changing network's size by scrolling inside the container.
	
*__NOTE:__ if the network isn't in a specific container, the actions can be done in the whole page.*
	
####Hiding/Showing elements.

```java
this.hideElement = function(id,type,element)
this.showElement = function(id,type,element)
```	

You can find your element by one of this three combinations:
	
* id+type: 	 `net.showElement("node1","node");`
* id:		 `net.showElement("node1");`
* element	 `net.showElement("","",node1);` 

There are certain elements that are automatically shown/hidden when you hide another one.
For example, if you hide a node, you will also be hidding its labels and associated links.

*__NOTE:__ in order to apply changes, you must draw again the network.*



	

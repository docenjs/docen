# PresentationML Slides - Properties - Transitions

Transitions between slides are stored at the slide level, so each slide can have a different transition if desired. The transition stored within a slide occurs after the content for that slide is presented. So the first slide is presented, followed by the transition stored within slide 1, followed by slide 2, followed by the transition stored within slide 2, etc. Transition information is specified within a <p:transition> element, which can be a child of either a <p:sld>, <p:sldLayout>, or a <p:sldMaster>.

There are essentially three components to a transition: (1) the type of transition, (2) what triggers the transition, and (3) the speed of the transition. The type is specified by child elements of <p:transition> and the other two components are specified as attributes.

Below is a sample transition consisting of a checker transition over a span of 2 seconds occurring at medium speed.

<p:sld>

<p:cSld>

. . .

</p:cSld>

<p:clrMapOvr>

. . .

</p:clrMapOvr>

<p:transition spd="med" advTm="2000">

<p:checker/>

</p:transition>

<p:timing>

. . .

</p:timing>

</p:sld>

## Transition Type

The type of transition is specified as a child element of the <p:transition> element. The following are the possible transition types.

| Element        | Description                                                                                                                                                                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <p:blinds/>    | Has an attribute dir to specify the direction, with possible values of horz and vert.                                                                                                                                                                       |
| <p:checker/>   | Has an attribute dir to specify the direction, with possible values of horz and vert.                                                                                                                                                                       |
| <p:circle/>    | Has an attribute dir to specify the direction, with possible values of horz and vert.                                                                                                                                                                       |
| <p:comb/>      | Has an attribute dir to specify the direction, with possible values of horz and vert.                                                                                                                                                                       |
| <p:cover/>     | Has an attribute dir to specify the direction, with possible values of d (down), l (left), r (right), u (up), ld (left down), lu (left up), rd (right down), ru (right up).                                                                                 |
| <p:cut/>       | Has an attribute thruBlk (transition through black) to specify if the transition starts from a black screen and then transitions to new slide over black; possible values are booleans.                                                                     |
| <p:diamond/>   |
| <p:dissolve/>  |
| <p:fade/>      | Has an attribute thruBlk (transition through black) to specify if the transition starts from a black screen and then transitions to new slide over black; possible values are booleans.                                                                     |
| <p:newsflash/> |
| <p:plus/>      |
| <p:pull/>      | Has an attribute dir to specify the direction, with possible values of d (down), l (left), r (right), u (up), ld (left down), lu (left up), rd (right down), ru (right up).                                                                                 |
| <p:push/>      | Has an attribute dir to specify the direction, with possible values of d (down), l (left), r (right), u (up).                                                                                                                                               |
| <p:random/>    | The application applies one of the available transitions at random.                                                                                                                                                                                         |
| <p:randomBar/> | Has an attribute dir to specify the direction, with possible values of horz and vert.                                                                                                                                                                       |
| <p:sndAc>      | Specifies a sound action to be used. The element contains child elements for the stop (<p:endSnd/>) and start (<p:stSnd/>) actions. Each of those elements contains a sound element <p:snd r:embed="rId2"/> with a relationship to the embedded sound file. |
| <p:split/>     | Has an attribute dir to specify the direction, with possible values of in and out. Also has an attribute orient to specify the orientation of, with values of horz and vert.                                                                                |
| <p:strips/>    | Has an attribute dir to specify the direction, with possible values of ld (left down), lu (left up), rd (right down), ru (right up).                                                                                                                        |
| <p:wedge/>     |
| <p:wheel/>     | Has an attribute spokes to specify the number of spokes in the wheel; values are integers.                                                                                                                                                                  |
| <p:wipe/>      | Has an attribute dir to specify the direction, with possible values of d (down), l (left), r (right), u (up).                                                                                                                                               |
| <p:zoom/>      | Has an attribute dir to specify the direction, with possible values of in and out.                                                                                                                                                                          |

## Transition Trigger

A slide can advance and a transition occur by a click of the mouse or automatically after a specified time. To specify that a mouse click should trigger the transition, specify a true value for the advClick attribute of <p:transition>. Note that this is the default behavior if the attribute is not specified. Even is a slide will automatically advance after a specified time, a mouse click with still advance the slide if this attribute is not specified or if it is set to true. A slide will advance automatically after a specified time without a mouse click if the advTm attribute of <p:transition> is set. A value for the attribute is in milliseconds, indicating the time after which the transition should occur. In the sample above, the transition will occur after 2 seconds (<p:transition spd="med" advTm="2000">).

## Transition Speed

The speed of a slide transition is specified by the spd attribute of <p:transition>. Possible values are fast, med, and slow.

Footer

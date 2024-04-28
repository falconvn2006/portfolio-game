import { dialogueData, scaleFactor } from "./constants";
import {k} from "./kaboom_ctx";
import { DisplayDialouge, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 39,
    sliceY: 31,
    anims: {
        "idle-down": 936,
        "walk-down": { from: 936, to: 939, loop: true, speed: 8},
        "idle-side": 975,
        "walk-side": { from: 975, to: 978, loop: true, speed: 8},
        "idle-up": 1014,
        "walk-up": { from: 1014, to: 1017, loop: true, speed: 8},
    }
});

k.loadSprite("map", "./map.png");
k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => {
    // Code
    const mapData = await (await fetch("./map.json")).json(); // Continue after finish fetch the map data
    const layers = mapData.layers;
    
    // Create the map
    const map = k.add([
        k.sprite("map"),
        k.pos(0),
        k.scale(scaleFactor)
    ]);

    // Create the player
    const player = k.make([
        k.sprite("spritesheet", {anim: "idle-down"}),
        // Collision stuff
        k.area({
            shape: new k.Rect(k.vec2(0, 3), 10, 10)
        }),
        k.body(),
        k.anchor("center"), // draw the player from the center not the left
        k.pos(),
        k.scale(scaleFactor),
        // Extra properties
        {
            speed: 250,
            direction: "down",
            isInDialogue: false,
        },
        "player", // Tag
    ]);

    for(const layer of layers)
    {
        if(layer.name === "boundaries")
        {
            for(const boundary of layer.objects)
            {
                map.add([
                    k.area({
                        shape: new k.Rect(k.vec2(0), boundary.width, boundary.height)
                    }),
                    k.body({isStatic: true}),
                    k.pos(boundary.x, boundary.y),
                    boundary.name,
                ]);
                
                if(boundary.name)
                {
                    player.onCollide(boundary.name, () => {
                        player.isInDialogue = true;
                        DisplayDialouge(dialogueData[boundary.name], () => {console.log("callback function"); player.isInDialogue = false});
                    });
                }
            }

            continue;
        }

        if(layer.name === "spawnpoints")
        {
            for(const entity of layer.objects){
                if(entity.name === "player")
                {
                    player.pos = k.vec2(
                        (map.pos.x + entity.x) * scaleFactor,
                        (map.pos.y + entity.y) * scaleFactor
                    );

                    k.add(player);
                    continue;
                }
            }
        }
    }

    setCamScale(k);

    k.onResize(() => {
        setCamScale(k);
    });

    k.onUpdate(() => {
        k.camPos(player.worldPos().x, player.worldPos().y);
    })

    k.onMouseDown((mouseBtn) => {
        if(mouseBtn !== "left" || player.isInDialogue)
            return;

        const worldMousePos = k.toWorld(k.mousePos());
        player.moveTo(worldMousePos, player.speed);

        const mouseAngle = player.pos.angle(worldMousePos);

        const lowerBound = 50;
        const upperBound = 125;

        // Check if the angle within the circle to go up
        if(mouseAngle > lowerBound && mouseAngle < upperBound && player.curAnim() !== "walk-up")
        {
            player.play("walk-up");
            player.direction = "up";

            return;
        }

        // Check if the angle within the circle to go down
        if(mouseAngle < -lowerBound && mouseAngle > -upperBound && player.curAnim() !== "walk-down")
        {
            player.play("walk-down");
            player.direction = "down";

            return;
        }

        // Check if the angle within the circle to go left or right
        if(Math.abs(mouseAngle) > upperBound) // right
        {
            player.flipX = false;
            if(player.curAnim() !== "walk-side") player.play("walk-side");

            player.direction = "right";
            return;
        }
        if(Math.abs(mouseAngle) < lowerBound) // left
        {
            player.flipX = true;
            if(player.curAnim() !== "walk-side") player.play("walk-side");

            player.direction = "left";
            return;
        }
    })

    k.onMouseRelease(() => {
        if(player.direction === "up")
        {
            player.play("idle-up");
            return;
        }
        if(player.direction === "down")
        {
            player.play("idle-down");
            return;
        }

        player.play("idle-side");
    });
});

k.go("main") // Default scene to run

# Protections

spawn protection system
user zones coming soon

Commands:
* /spawn - Teleport to spawn
* /changespawn - Change spawn protection settings

## spawn.json Usage/Examples

```json
{
    "x": 0, //spawn X coordinates
    "y": 0, //spawn Y coordinates
    "z": 0, //spawn Z coordinates
    "type": 1, //0 = xyz, 1 = xz & 2 = floor
    "range": 80, //protection distance
    "level": {
        "explode": false, //allow explosions
        "placeblock": false, //allow to place blocks
        "destroyblock": false, //allow to destroy blocks
        "blockinteracted": false //allow interaction with blocks
    },
    "pvp": false, //allow pvp
    "pve": false, //allow pve
    "damage": true, //allow damae
    "monsters": false, //allow spawning of mobs
    "teleport": { //command /spawn
        "enabled": true, //allow
        "time": 0 //waiting time to use it again (seconds)
    }
}
```


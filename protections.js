"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actor_1 = require("bdsx/bds/actor");
const blockpos_1 = require("bdsx/bds/blockpos");
const player_1 = require("bdsx/bds/player");
const launcher_1 = require("bdsx/launcher");
const utils_1 = require("./utils");
const event_1 = require("bdsx/event");
const command_1 = require("bdsx/command");
const common_1 = require("bdsx/common");
const command_2 = require("bdsx/bds/command");
const packetids_1 = require("bdsx/bds/packetids");
const form_1 = require("bdsx/bds/form");
var CollisionType;
(function (CollisionType) {
    CollisionType[CollisionType["xyz"] = 0] = "xyz";
    CollisionType[CollisionType["xz"] = 1] = "xz";
    CollisionType[CollisionType["floor"] = 2] = "floor";
})(CollisionType || (CollisionType = {}));
const spawn = (0, utils_1.Json)((0, utils_1.LoadFile)(utils_1.FolderType.plugin, "", "spawn", "json", `{
    "x": 0,
    "y": 0,
    "z": 0,
    "type": 1,
    "range": 80,
    "level": {
        "explode": false,
        "placeblock": false,
        "destroyblock": false,
        "blockinteracted": false
    },
    "pvp": false,
    "pve": false,
    "damage": true,
    "monsters": false,
    "teleport": {
        "enabled": true,
        "time": 0
    }
}`));
if (spawn.x == 0 && spawn.y == 0 && spawn.z == 0)
    (0, utils_1.Print)(`Spawn detected with coordinates 0,0,0. change them in the spawn.json file to avoid problems`, utils_1.TypePrint.alert);
(0, utils_1.Folder)(utils_1.FolderType.plugin, ``, `users`);
function isCollisionActorBlock(actor, x, y, z, range, type = CollisionType.xyz) {
    let isX = false;
    let isY = false;
    let isZ = false;
    for (let i = Math.floor(x) - Math.floor(range); i < Math.floor(x) + Math.floor(range); i++) {
        if (i == Math.floor(actor.getPosition().x)) {
            isX = true;
        }
    }
    switch (type) {
        case CollisionType.xyz: {
            for (let i = Math.floor(y) - Math.floor(range); i < Math.floor(y) + Math.floor(range); i++) {
                if (i == Math.floor(actor.getPosition().y)) {
                    isY = true;
                }
            }
            break;
        }
        case CollisionType.floor: {
            if (Math.floor(y) == Math.floor(actor.getPosition().y)) {
                isY = true;
            }
            break;
        }
        case CollisionType.xz: {
            isY = true;
            break;
        }
    }
    for (let i = Math.floor(z) - Math.floor(range); i < Math.floor(z) + Math.floor(range); i++) {
        if (i == Math.floor(actor.getPosition().z)) {
            isZ = true;
        }
    }
    return (isX && isY && isZ);
}
function isCoordNearbyActorFromBlock(actor, x, y, z, range, type = CollisionType.xyz) {
    switch (type) {
        case CollisionType.xyz: {
            const distance = Math.sqrt((Math.floor(x) - Math.floor(actor.getPosition().x)) * (Math.floor(x) - Math.floor(actor.getPosition().x)) + (Math.floor(y) - Math.floor(actor.getPosition().y)) * (Math.floor(y) - Math.floor(actor.getPosition().y)) + (Math.floor(z) - Math.floor(actor.getPosition().z)) * (Math.floor(z) - Math.floor(actor.getPosition().z)));
            return distance <= range;
        }
        case CollisionType.floor: {
            const distance = Math.sqrt((Math.floor(x) - Math.floor(actor.getPosition().x)) * (Math.floor(x) - Math.floor(actor.getPosition().x)) + (Math.floor(z) - Math.floor(actor.getPosition().z)) * (Math.floor(z) - Math.floor(actor.getPosition().z)));
            return (distance <= range && Math.floor(y) == Math.floor(actor.getPosition().y));
        }
        case CollisionType.xz: {
            const distance = Math.sqrt((Math.floor(x) - Math.floor(actor.getPosition().x)) * (Math.floor(x) - Math.floor(actor.getPosition().x)) + (Math.floor(z) - Math.floor(actor.getPosition().z)) * (Math.floor(z) - Math.floor(actor.getPosition().z)));
            return distance <= range;
        }
    }
}
function isCollisionActorActor(self, target, range, type = CollisionType.xyz) {
    let isX = false;
    let isY = false;
    let isZ = false;
    if (self.getDimensionId() != target.getDimensionId())
        return false;
    for (let i = Math.floor(target.getPosition().x) - Math.floor(range); i < Math.floor(target.getPosition().x) + Math.floor(range); i++) {
        if (i == Math.floor(self.getPosition().x)) {
            isX = true;
        }
    }
    switch (type) {
        case CollisionType.xyz: {
            for (let i = Math.floor(target.getPosition().y) - Math.floor(range); i < Math.floor(target.getPosition().y) + Math.floor(range); i++) {
                if (i == Math.floor(self.getPosition().y)) {
                    isY = true;
                }
            }
            break;
        }
        case CollisionType.floor: {
            if (Math.floor(target.getPosition().y) == Math.floor(self.getPosition().y)) {
                isY = true;
            }
            break;
        }
        case CollisionType.xz: {
            isY = true;
            break;
        }
    }
    for (let i = Math.floor(target.getPosition().z) - Math.floor(range); i < Math.floor(target.getPosition().z) + Math.floor(range); i++) {
        if (i == Math.floor(self.getPosition().z)) {
            isZ = true;
        }
    }
    return (isX && isY && isZ);
}
function isCoordNearbyActorFromActor(self, target, range, type = CollisionType.xyz) {
    if (self.getDimensionId() != target.getDimensionId())
        return false;
    switch (type) {
        case CollisionType.xyz: {
            const distance = Math.sqrt((Math.floor(target.getPosition().x) - Math.floor(self.getPosition().x)) * (Math.floor(target.getPosition().x) - Math.floor(self.getPosition().x)) + (Math.floor(target.getPosition().y) - Math.floor(self.getPosition().y)) * (Math.floor(target.getPosition().y) - Math.floor(self.getPosition().y)) + (Math.floor(target.getPosition().z) - Math.floor(self.getPosition().z)) * (Math.floor(target.getPosition().z) - Math.floor(self.getPosition().z)));
            return distance <= range;
        }
        case CollisionType.floor: {
            const distance = Math.sqrt((Math.floor(target.getPosition().x) - Math.floor(self.getPosition().x)) * (Math.floor(target.getPosition().x) - Math.floor(self.getPosition().x)) + (Math.floor(target.getPosition().z) - Math.floor(self.getPosition().z)) * (Math.floor(target.getPosition().z) - Math.floor(self.getPosition().z)));
            return (distance <= range && Math.floor(target.getPosition().y) == Math.floor(self.getPosition().y));
        }
        case CollisionType.xz: {
            const distance = Math.sqrt((Math.floor(target.getPosition().x) - Math.floor(self.getPosition().x)) * (Math.floor(target.getPosition().x) - Math.floor(self.getPosition().x)) + (Math.floor(target.getPosition().z) - Math.floor(self.getPosition().z)) * (Math.floor(target.getPosition().z) - Math.floor(self.getPosition().z)));
            return distance <= range;
        }
    }
}
function isCollisionBlockBlock(self, target, range, type = CollisionType.xyz) {
    let isX = false;
    let isY = false;
    let isZ = false;
    for (let i = Math.floor(target.x) - Math.floor(range); i < Math.floor(target.x) + Math.floor(range); i++) {
        if (i == Math.floor(self.x)) {
            isX = true;
        }
    }
    switch (type) {
        case CollisionType.xyz: {
            for (let i = Math.floor(target.y) - Math.floor(range); i < Math.floor(target.y) + Math.floor(range); i++) {
                if (i == Math.floor(self.y)) {
                    isY = true;
                }
            }
            break;
        }
        case CollisionType.floor: {
            if (Math.floor(target.y) == Math.floor(self.y)) {
                isY = true;
            }
            break;
        }
        case CollisionType.xz: {
            isY = true;
            break;
        }
    }
    for (let i = Math.floor(target.z) - Math.floor(range); i < Math.floor(target.z) + Math.floor(range); i++) {
        if (i == Math.floor(self.z)) {
            isZ = true;
        }
    }
    return (isX && isY && isZ);
}
function isCoordNearby(self, target, range, type = CollisionType.xyz) {
    switch (type) {
        case CollisionType.xyz: {
            const distance = Math.sqrt((Math.floor(target.x) - Math.floor(self.x)) * (Math.floor(target.x) - Math.floor(self.x)) + (Math.floor(target.y) - Math.floor(self.y)) * (Math.floor(target.y) - Math.floor(self.y)) + (Math.floor(target.z) - Math.floor(self.z)) * (Math.floor(target.z) - Math.floor(self.z)));
            return distance <= range;
        }
        case CollisionType.floor: {
            const distance = Math.sqrt((Math.floor(target.x) - Math.floor(self.x)) * (Math.floor(target.x) - Math.floor(self.x)) + (Math.floor(target.z) - Math.floor(self.z)) * (Math.floor(target.z) - Math.floor(self.z)));
            return (distance <= range && Math.floor(target.y) == Math.floor(self.y));
        }
        case CollisionType.xz: {
            const distance = Math.sqrt((Math.floor(target.x) - Math.floor(self.x)) * (Math.floor(target.x) - Math.floor(self.x)) + (Math.floor(target.z) - Math.floor(self.z)) * (Math.floor(target.z) - Math.floor(self.z)));
            return distance <= range;
        }
    }
}
function LoadPlayer(xuid) {
    return (0, utils_1.Json)((0, utils_1.LoadFile)(utils_1.FolderType.plugin, "users/", xuid));
}
function SavePlayer(xuid, data) {
    (0, utils_1.SaveFile)(utils_1.FolderType.plugin, "users/", xuid, data);
}
command_1.command.register('spawn', 'Teleport to spawn point').overload((param, origin, output) => {
    if (origin.isServerCommandOrigin())
        return;
    if (spawn.teleport.enabled) {
        const player = origin.getEntity().getNetworkIdentifier().getActor();
        const data = LoadPlayer(player.getXuid());
        if (!data.spawn)
            data.spawn = { teleport_time: 0 };
        if (!data.spawn.teleport_time)
            data.spawn.teleport_time = 0;
        if (data.spawn.teleport_time > (0, utils_1.Time)() && player.getPermissionLevel() != player_1.PlayerPermission.OPERATOR) {
            output.error(`You must wait ${spawn.teleport.time} seconds to use this command again`);
        }
        else {
            player.teleport(blockpos_1.Vec3.create(spawn.x + 0.5, spawn.y, spawn.z + 0.5), actor_1.DimensionId.Overworld);
            data.spawn.teleport_time = (0, utils_1.Time)(spawn.teleport.time);
            SavePlayer(player.getXuid(), (0, utils_1.Json)(data));
        }
    }
    else {
        output.error(`Teleportation to spawn is not available`);
    }
}, {});
var SendType;
(function (SendType) {
    SendType[SendType["Actionbar"] = 0] = "Actionbar";
    SendType[SendType["ArmorSlot"] = 1] = "ArmorSlot";
    SendType[SendType["Chat"] = 2] = "Chat";
    SendType[SendType["Inventory"] = 3] = "Inventory";
    SendType[SendType["JukeboxPopup"] = 4] = "JukeboxPopup";
    SendType[SendType["Message"] = 5] = "Message";
    SendType[SendType["NetworkPacket"] = 6] = "NetworkPacket";
    SendType[SendType["Packet"] = 7] = "Packet";
    SendType[SendType["Popup"] = 8] = "Popup";
    SendType[SendType["TextObject"] = 9] = "TextObject";
    SendType[SendType["Tip"] = 10] = "Tip";
    SendType[SendType["ToastRequest"] = 11] = "ToastRequest";
    SendType[SendType["TranslatedMessage"] = 12] = "TranslatedMessage";
    SendType[SendType["Whisper"] = 13] = "Whisper";
    SendType[SendType["Title"] = 14] = "Title";
})(SendType || (SendType = {}));
function sendAll(type, data) {
    for (const player of launcher_1.bedrockServer.level.getPlayers()) {
        switch (type) {
            case SendType.Actionbar: {
                player.sendActionbar(data.message);
                break;
            }
            case SendType.ArmorSlot: {
                player.sendArmorSlot(data.armorSlot);
                break;
            }
            case SendType.Chat: {
                player.sendChat(data.message, data.author);
                break;
            }
            case SendType.Inventory: {
                player.sendInventory(data.should);
                break;
            }
            case SendType.JukeboxPopup: {
                player.sendJukeboxPopup(data.message, data.params);
                break;
            }
            case SendType.Message: {
                player.sendMessage(data.message);
                break;
            }
            case SendType.NetworkPacket: {
                player.sendNetworkPacket(data.packet);
                break;
            }
            case SendType.Packet: {
                player.sendPacket(data.packet);
                break;
            }
            case SendType.Popup: {
                player.sendPopup(data.message, data.params);
                break;
            }
            case SendType.TextObject: {
                player.sendTextObject(data.object);
                break;
            }
            case SendType.Tip: {
                player.sendTip(data.message, data.params);
                break;
            }
            case SendType.ToastRequest: {
                player.sendToastRequest(data.title, data.body);
                break;
            }
            case SendType.TranslatedMessage: {
                player.sendTranslatedMessage(data.message, data.params);
                break;
            }
            case SendType.Whisper: {
                player.sendWhisper(data.message, data.author);
                break;
            }
            case SendType.Title: {
                player.sendTitle(data.title, data.subtitle);
                break;
            }
        }
    }
}
event_1.events.blockDestroy.on(ev => {
    if (ev.player.getDimensionId() == actor_1.DimensionId.Overworld) {
        if (!spawn.level.destroyblock) {
            if (isCoordNearby(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.blockPos.x, ev.blockPos.y, ev.blockPos.z), spawn.range + 30, spawn.type)) {
                if (isCollisionBlockBlock(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.blockPos.x, ev.blockPos.y, ev.blockPos.z), spawn.range, spawn.type)) {
                    if (ev.player && ev.player.isPlayer()) {
                        ev.player.sendActionbar(`This area is protected`);
                        if (ev.player.getPermissionLevel() != player_1.PlayerPermission.OPERATOR)
                            return common_1.CANCEL;
                    }
                    else
                        return common_1.CANCEL;
                }
            }
        }
    }
});
event_1.events.blockPlace.on(ev => {
    if (ev.player.getDimensionId() == actor_1.DimensionId.Overworld) {
        if (!spawn.level.placeblock) {
            if (isCoordNearby(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.blockPos.x, ev.blockPos.y, ev.blockPos.z), spawn.range + 30, spawn.type)) {
                if (isCollisionBlockBlock(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.blockPos.x, ev.blockPos.y, ev.blockPos.z), spawn.range, spawn.type)) {
                    if (ev.player && ev.player.isPlayer()) {
                        ev.player.sendActionbar(`This area is protected`);
                        if (ev.player.getPermissionLevel() != player_1.PlayerPermission.OPERATOR)
                            return common_1.CANCEL;
                    }
                    else
                        return common_1.CANCEL;
                }
            }
        }
    }
});
event_1.events.blockInteractedWith.on(ev => {
    if (ev.player.getDimensionId() == actor_1.DimensionId.Overworld) {
        if (!spawn.level.blockinteracted) {
            if (isCoordNearby(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.blockPos.x, ev.blockPos.y, ev.blockPos.z), spawn.range + 30, spawn.type)) {
                if (isCollisionBlockBlock(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.blockPos.x, ev.blockPos.y, ev.blockPos.z), spawn.range, spawn.type)) {
                    if (ev.player.isPlayer()) {
                        ev.player.sendActionbar(`This area is protected`);
                        if (ev.player.getPermissionLevel() != player_1.PlayerPermission.OPERATOR)
                            return common_1.CANCEL;
                    }
                    else
                        return common_1.CANCEL;
                }
            }
        }
    }
});
event_1.events.attackBlock.on(ev => {
    if (ev.player && ev.player.getDimensionId() == actor_1.DimensionId.Overworld) {
        if (!spawn.level.blockinteracted) {
            if (isCoordNearby(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.blockPos.x, ev.blockPos.y, ev.blockPos.z), spawn.range + 30, spawn.type)) {
                if (isCollisionBlockBlock(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.blockPos.x, ev.blockPos.y, ev.blockPos.z), spawn.range, spawn.type)) {
                    if (ev.player.isPlayer()) {
                        ev.player.sendActionbar(`This area is protected`);
                        if (ev.player.getPermissionLevel() != player_1.PlayerPermission.OPERATOR)
                            return common_1.CANCEL;
                    }
                    else
                        return common_1.CANCEL;
                }
            }
        }
    }
});
event_1.events.itemUseOnBlock.on(ev => {
    if (!ev.itemStack.isBlock()) {
        if (ev.actor && ev.actor.getDimensionId() == actor_1.DimensionId.Overworld) {
            if (!spawn.level.blockinteracted) {
                if (isCoordNearby(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.x, ev.y, ev.z), spawn.range + 30, spawn.type)) {
                    if (isCollisionBlockBlock(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.x, ev.y, ev.z), spawn.range, spawn.type)) {
                        if (ev.actor.isPlayer()) {
                            ev.actor.sendActionbar(`This area is protected`);
                            if (ev.actor.getPermissionLevel() != player_1.PlayerPermission.OPERATOR)
                                return common_1.CANCEL;
                        }
                        else
                            return common_1.CANCEL;
                    }
                }
            }
        }
    }
});
event_1.events.levelExplode.on(ev => {
    if (!spawn.level.explode) {
        let protect = true;
        if (ev.entity) {
            if (ev.entity.getDimensionId() != actor_1.DimensionId.Overworld) {
                protect = false;
            }
        }
        if (protect) {
            if (isCoordNearby(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.position.x, ev.position.y, ev.position.z), spawn.range + 34, spawn.type)) {
                if (isCollisionBlockBlock(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.position.x, ev.position.y, ev.position.z), spawn.range + 4, spawn.type)) {
                    ev.power = 0;
                    ev.causesFire = false;
                    ev.breaksBlocks = false;
                }
            }
        }
    }
});
event_1.events.entityHurt.on(ev => {
    if (ev.entity && ev.entity.getDimensionId() == actor_1.DimensionId.Overworld) {
        if (!spawn.damage) {
            if (isCoordNearby(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.entity.getPosition().x, ev.entity.getPosition().y, ev.entity.getPosition().z), spawn.range + 30, spawn.type)) {
                if (isCollisionBlockBlock(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.entity.getPosition().x, ev.entity.getPosition().y, ev.entity.getPosition().z), spawn.range, spawn.type)) {
                    if (ev.entity && ev.entity.isPlayer())
                        ev.entity.sendActionbar(`This area is protected`);
                    return common_1.CANCEL;
                }
            }
        }
    }
});
event_1.events.playerAttack.on(ev => {
    if (ev.player.getDimensionId() == actor_1.DimensionId.Overworld) {
        if (ev.victim.isPlayer()) {
            if (!spawn.pvp) {
                if (isCoordNearby(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.victim.getPosition().x, ev.victim.getPosition().y, ev.victim.getPosition().z), spawn.range + 30, spawn.type)) {
                    if (isCollisionBlockBlock(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.victim.getPosition().x, ev.victim.getPosition().y, ev.victim.getPosition().z), spawn.range, spawn.type)) {
                        ev.player.sendActionbar(`This area is protected`);
                        return common_1.CANCEL;
                    }
                }
            }
        }
        else if (ev.victim.isMob()) {
            if (!spawn.pve) {
                if (isCoordNearby(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.victim.getPosition().x, ev.victim.getPosition().y, ev.victim.getPosition().z), spawn.range + 30, spawn.type)) {
                    if (isCollisionBlockBlock(blockpos_1.Vec3.create(spawn.x, spawn.y, spawn.z), blockpos_1.Vec3.create(ev.victim.getPosition().x, ev.victim.getPosition().y, ev.victim.getPosition().z), spawn.range, spawn.type)) {
                        ev.player.sendActionbar(`This area is protected`);
                        return common_1.CANCEL;
                    }
                }
            }
        }
    }
});
event_1.events.packetSend(packetids_1.MinecraftPacketIds.SetActorData).on((ptr, net) => {
    const player = net.getActor();
    if (player.getDimensionId() == actor_1.DimensionId.Overworld) {
        if (isCoordNearbyActorFromBlock(player, spawn.x, spawn.y, spawn.z, spawn.range + 15, spawn.type)) {
            if (!player.hasTag("zone_spawn")) {
                if (isCollisionActorBlock(player, spawn.x, spawn.y, spawn.z, spawn.range, spawn.type)) {
                    player.sendTitle(`§sSpawn`, `§6Protected area`);
                    player.addTag("zone_spawn");
                }
            }
        }
        else {
            if (player.hasTag("zone_spawn")) {
                player.removeTag("zone_spawn");
            }
        }
    }
});
event_1.events.command.on((command, origin, ctx) => {
    let param = command.split(" ");
    if (param[0] == "/setworldspawn" || param[0] == "setworldspawn") {
        if (ctx.origin.getEntity()) {
            const player = ctx.origin.getEntity().getNetworkIdentifier().getActor();
            if (player) {
                if (param[1].lastIndexOf("~") >= 0)
                    param[1] = `${player.getPosition().x}`;
                if (param[2].lastIndexOf("~") >= 0)
                    param[2] = `${player.getPosition().y}`;
                if (param[3].lastIndexOf("~") >= 0)
                    param[3] = `${player.getPosition().z}`;
            }
        }
        spawn.x = Math.floor(parseInt(param[1]));
        spawn.y = Math.floor(parseInt(param[2]));
        spawn.z = Math.floor(parseInt(param[3]));
        (0, utils_1.SaveFile)(utils_1.FolderType.plugin, "", "spawn", (0, utils_1.Json)(spawn));
    }
    return;
});
function ChangeSpawn(target) {
    const form = new form_1.CustomForm();
    form.setTitle(`Edit Spawn`);
    form.addComponent(new form_1.FormLabel(`Position`));
    form.addComponent(new form_1.FormInput(`X:`, `Coord X`, `${spawn.x}`), `x`);
    form.addComponent(new form_1.FormInput(`Y:`, `Coord Y`, `${spawn.y}`), `y`);
    form.addComponent(new form_1.FormInput(`Z:`, `Coord Z`, `${spawn.z}`), `z`);
    form.addComponent(new form_1.FormDropdown(`Zone type:`, ["XYZ", "XZ", "Floor"], spawn.type), `type`);
    form.addComponent(new form_1.FormSlider(`Zone distance:`, 1, 500, 1, spawn.range), `range`);
    form.addComponent(new form_1.FormLabel(`Terrain options`));
    form.addComponent(new form_1.FormToggle(`Allow explosions`, spawn.level.explode), `level_explode`);
    form.addComponent(new form_1.FormToggle(`Allow to place blocks`, spawn.level.placeblock), `level_placeblock`);
    form.addComponent(new form_1.FormToggle(`Allow to destroy blocks`, spawn.level.destroyblock), `level_destroyblock`);
    form.addComponent(new form_1.FormToggle(`Allow to interact blocks`, spawn.level.blockinteracted), `level_blockinteracted`);
    form.addComponent(new form_1.FormToggle(`Allow attacking players`, spawn.pvp), `pvp`);
    form.addComponent(new form_1.FormToggle(`Allow attacking mobs`, spawn.pve), `pve`);
    form.addComponent(new form_1.FormToggle(`Allow damage`, spawn.damage), `damage`);
    form.addComponent(new form_1.FormToggle(`Allow mobs (zombies, skeletons, etc)`, spawn.monsters), `monsters`);
    form.addComponent(new form_1.FormLabel(`Command /spawn:`));
    form.addComponent(new form_1.FormToggle(`Allow`, spawn.teleport.enabled), `teleport_enabled`);
    form.addComponent(new form_1.FormSlider(`Wait time (seconds)`, 1, 300, 1, spawn.teleport.time), `teleport_time`);
    form.sendTo(target, (form, target) => {
        if (form.response) {
            spawn.x = Math.floor(parseInt(form.response.x));
            spawn.y = Math.floor(parseInt(form.response.y));
            spawn.z = Math.floor(parseInt(form.response.z));
            spawn.type = form.response.type;
            spawn.range = form.response.range;
            spawn.level.explode = form.response.level_explode;
            spawn.level.placeblock = form.response.level_placeblock;
            spawn.level.destroyblock = form.response.level_destroyblock;
            spawn.level.blockinteracted = form.response.level_blockinteracted;
            spawn.pvp = form.response.pvp;
            spawn.pve = form.response.pve;
            spawn.damage = form.response.damage;
            spawn.monsters = form.response.monsters;
            spawn.teleport.enabled = form.response.teleport_enabled;
            spawn.teleport.time = form.response.teleport_time;
            (0, utils_1.SaveFile)(utils_1.FolderType.plugin, "", "spawn", (0, utils_1.Json)(spawn));
            target.getActor().sendMessage(`Changes applied`);
        }
    });
}
command_1.command.register('changespawn', 'Change spawn options', command_2.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    if (origin.isServerCommandOrigin())
        return;
    ChangeSpawn(origin.getEntity().getNetworkIdentifier());
}, {});
const Entitys = new Map();
event_1.events.entityCreated.on(ev => {
    if (!spawn.monsters && ev.entity.getDimensionId() == actor_1.DimensionId.Overworld && ev.entity.hasFamily("monster")) {
        Entitys.set(ev.entity.getRuntimeID(), ev.entity.getRuntimeID());
    }
});
const thred = setInterval(function () {
    for (const runtime of Entitys.values()) {
        const entity = launcher_1.bedrockServer.level.getRuntimeEntity(runtime);
        if (!entity) {
            Entitys.delete(runtime);
            continue;
        }
        if (entity.getStatusFlag(actor_1.ActorFlags.Tamed))
            continue;
        if (isCoordNearbyActorFromBlock(entity, spawn.x, spawn.y, spawn.z, spawn.range + 30, spawn.type)) {
            if (isCollisionActorBlock(entity, spawn.x, spawn.y, spawn.z, spawn.range, spawn.type)) {
                entity.despawn();
            }
        }
    }
}, 250);
event_1.events.serverLeave.on(() => {
    clearInterval(thred);
});
event_1.events.playerJoin.on(ev => {
});
event_1.events.playerLeft.on(ev => {
});
launcher_1.bedrockServer.executeCommand(`setworldspawn ${spawn.x} ${spawn.y} ${spawn.z}`);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdGVjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwcm90ZWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBDQUFnRjtBQUNoRixnREFBeUM7QUFDekMsNENBQTJEO0FBQzNELDRDQUE4QztBQUM5QyxtQ0FBdUc7QUFDdkcsc0NBQW9DO0FBQ3BDLDBDQUF1QztBQUN2Qyx3Q0FBcUM7QUFDckMsOENBQTBEO0FBQzFELGtEQUF3RDtBQUN4RCx3Q0FBdUc7QUFHdkcsSUFBSyxhQUlKO0FBSkQsV0FBSyxhQUFhO0lBQ2QsK0NBQUcsQ0FBQTtJQUNILDZDQUFFLENBQUE7SUFDRixtREFBSyxDQUFBO0FBQ1QsQ0FBQyxFQUpJLGFBQWEsS0FBYixhQUFhLFFBSWpCO0FBRUQsTUFBTSxLQUFLLEdBQUcsSUFBQSxZQUFJLEVBQUMsSUFBQSxnQkFBUSxFQUFDLGtCQUFVLENBQUMsTUFBTSxFQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUMsTUFBTSxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQW9COUQsQ0FBQyxDQUFDLENBQUM7QUFFTCxJQUFHLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQztJQUMzQyxJQUFBLGFBQUssRUFBQyw2RkFBNkYsRUFBRSxpQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRTFILElBQUEsY0FBTSxFQUFDLGtCQUFVLENBQUMsTUFBTSxFQUFDLEVBQUUsRUFBQyxPQUFPLENBQUMsQ0FBQztBQUVyQyxTQUFTLHFCQUFxQixDQUFDLEtBQVksRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxLQUFhLEVBQUUsT0FBc0IsYUFBYSxDQUFDLEdBQUc7SUFDaEksSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDO0lBQ2hCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQztJQUNoQixJQUFJLEdBQUcs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LEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOVYsT0FBTyxRQUFRLElBQUksS0FBSyxDQUFDO1NBQzVCO1FBQ0QsS0FBSyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxD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Q0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RkLE9BQU8sUUFBUSxJQUFJLEtBQUssQ0FBQztTQUM1QjtRQUNELEtBQUssYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbFUsT0FBTyxDQUFDLFFBQVEsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN4RztRQUNELEtBQUssYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFD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
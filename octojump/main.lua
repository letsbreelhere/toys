Love = require("love")

BackgroundColor = { 142, 179, 245, 255 }

local function rgbToFloat(rgba)
  local r, g, b, a = rgba[1], rgba[2], rgba[3], rgba[4]
  return r / 255.0, g / 255.0, b / 255.0, a / 255.0
end

local function randFloat(min, max)
  return min + math.random() * (max - min)
end


RIGHT = "right"
LEFT = "left"
Gravity = 150

Character = {}

function Character:new()
  local o = {
    x = 128-16,
    y = 0,
    facing = RIGHT,
    width = 16,
    height = 16,
    speed = {
      x = 0,
      y = 0
    },
    strafeSpeed = 80,
    jumpAccel = 200,
  }
  setmetatable(o, self)
  self.__index = self
  return o
end

function Character:draw()
  local xOffset
  if self.facing == RIGHT then
    xOffset = 0
  else
    xOffset = 32
  end
  local xScale
  if self.facing == RIGHT then
    xScale = 2
  else
    xScale = -2
  end
  Love.graphics.draw(Graphics.octopus, self.x + xOffset, self.y + 2, 0, xScale, 2)
end

function Character:fall(dt)
  self.y = self.y + self.speed.y * dt
  self.speed.y = self.speed.y + Gravity * dt
  self.speed.y = math.min(self.speed.y, 100)
end

Bubble = {}

function Bubble:new(x, y)
  local o = {
    startx = x,
    x = x,
    y = y,
    width = 16,
    height = 16,
    timer = 0,
    wobbleWidth = randFloat(10, 32),
    wobbleRate = math.random() * 2,
    wobblex = 0,
    offset = math.random() * 2 * math.pi
  }

  setmetatable(o, self)
  self.__index = self
  return o
end

function Bubble:draw()
  Love.graphics.draw(Graphics.bubble, self.x, self.y, 0, 2, 2)
end

function Bubble:update(dt)
  self.y = self.y - 100 * dt
  self.timer = self.timer + dt

  self.x = self.startx + self.wobbleWidth * math.sin(self.offset + self.y/20 * self.wobbleRate)
  if self.x < -32 then
    self.x = -32
  elseif self.x > 256 then
    self.x = 256
  end
  self.timer = 0
end

GameState = {}
function GameState:new()
  local o = {
    score = 0,
    bubbles = {},
    nextBubble = 0,
    bubbleTimer = 0,
    character = Character:new(),
    gameOver = false
  }
  setmetatable(o, self)
  self.__index = self
  return o
end

function GameState:draw()
  if self.gameOver then
    local text = "Game Over! Score: " .. self.score
    local textWidth = Love.graphics.getFont():getWidth(text)
    Love.graphics.print(text, 128 - textWidth/2, 256)
    text = "Press space to restart"
    textWidth = Love.graphics.getFont():getWidth(text)
    Love.graphics.print(text, 128 - textWidth/2, 256 + 16)
    return
  end

  Love.graphics.print("Score: " .. self.score, 0, 0)

  for _, bubble in pairs(self.bubbles) do
    bubble:draw()
  end

  self.character:draw()
end

function GameState:checkCollision()
  for i, bubble in pairs(self.bubbles) do
    local bubbleCenter = {
      x = bubble.x,
      y = bubble.y
    }
    local charCenter = {
      x = self.character.x,
      y = self.character.y
    }
    local distanceSq = (bubbleCenter.x - charCenter.x)^2 + (bubbleCenter.y - charCenter.y)^2
    local collides = distanceSq < 16^2
    if collides then
      self.character.speed.y = - self.character.speed.y - 40

      table.remove(self.bubbles, i)

      self.score = self.score + 1
    end
  end
end

function GameState:update(dt)
  self.character:fall(dt)

  self.bubbleTimer = self.bubbleTimer + dt

  if self.bubbleTimer > self.nextBubble then
    table.insert(self.bubbles, Bubble:new(math.random(0, 256-16), 512 - 16))
    self.bubbleTimer = 0
    self.nextBubble = randFloat(0.5, 1)
  end

  for i, bubble in pairs(self.bubbles) do
    bubble:update(dt)
    if bubble.y < 0 then
      table.remove(self.bubbles, i)
    end
  end

  self:checkCollision()

  if self.character.y > 512 then
    self.gameOver = true
  end
end

local gameState = GameState:new()

function Love.load()
  Graphics = {
    bubble = Love.graphics.newImage("images/bubble.png"),
    octopus = Love.graphics.newImage("images/octo1.png")
  }
  for _, image in pairs(Graphics) do
    image:setFilter("nearest", "nearest")
  end
  Arena = Love.graphics.newCanvas(256, 512)
  Arena:setFilter("nearest", "nearest")
  Love.window.setMode(512, 1024)
end

function Love.update(dt)
  if Love.keyboard.isDown("h") or Love.keyboard.isDown("left") then
    gameState.character.x = gameState.character.x - gameState.character.strafeSpeed * dt
    gameState.character.facing = LEFT
  elseif Love.keyboard.isDown("l") or Love.keyboard.isDown("right") then
    gameState.character.x = gameState.character.x + gameState.character.strafeSpeed * dt
    gameState.character.facing = RIGHT
  elseif Love.keyboard.isDown("space") then
    gameState = GameState:new()
  end

  gameState:update(dt)
end

function Love.draw()
  Love.graphics.setCanvas(Arena)
  Love.graphics.clear(rgbToFloat(BackgroundColor))

  gameState:draw()

  Love.graphics.setCanvas()
  Love.graphics.draw(Arena, 0, 0, 0, 2, 2)
end

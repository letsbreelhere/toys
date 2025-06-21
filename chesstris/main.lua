local love = require("love")

GameObject = {}
function GameObject:new(x, y, image)
   local o = { x = x, y = y, z = 0, image = image }
   setmetatable(o, self)
   self.__index = self
   return o
end

function GameObject:draw()
   love.graphics.draw(self.image, self.x, self.y)
end

GameState = {}
function GameState:new()
   local o = { objects = {}, dragging = nil }
   setmetatable(o, self)
   self.__index = self
   return o
end

function GameState:draw()
   for _, object in ipairs(self.objects) do
      object:draw()
   end
end

function GameState:update(dt)
   if love.mouse.isDown(1) then
      if not self.dragging then
         local mx, my = love.mouse.getPosition()
         for _, object in ipairs(self.objects) do
            if mx >= object.x and mx <= object.x + object.image:getWidth() and my >= object.y and my <= object.y + object.image:getHeight() then
               self.dragging = object
               break
            end
         end
      end
      if self.dragging then
         self.dragging.x, self.dragging.y = love.mouse.getPosition()
      end
   else
      self.dragging = nil
   end
end

function GameState:add_object(object)
   table.insert(self.objects, object)
end

local function round(n)
   return math.floor(n + 0.5)
end

local piece_names = {
   "pawn",
   -- "rook",
   "knight",
   "bishop",
   -- "queen",
   -- "king"
}

local function load_images()
   local piece_images = {}
   for _, name in ipairs(piece_names) do
      local filename = name .. ".png"
      piece_images[name] = love.graphics.newImage("assets/images/" .. filename)
   end

   return {
      pieces = piece_images
   }
end

SquareSize = 64

function love.load()
   love.window.setTitle("Chess")
   love.window.setMode(2 * 8 * 32, 2 * 8 * 32, {
      resizable = true,
      minwidth = 8 * SquareSize,
      minheight = 8 * SquareSize
   })
   love.graphics.setDefaultFilter("nearest", "nearest")
end

function love.resize(w, h)
   local ratio = math.min(w, h) / (8 * 32)
   SquareSize = 32 * math.floor(ratio)
end

function love.update(dt)
   if love.mouse.isDown(1) then
      if not Dragging then
         local mx, my = love.mouse.getPosition()
         if mx >= X and mx <= X + SquareSize and my >= Y and my <= Y + SquareSize then
            Dragging = true
         end
      end
      if Dragging then
         X, Y = love.mouse.getPosition()
         X = X - SquareSize / 2
         Y = Y - SquareSize / 2
      end
   else
      Dragging = false

      X = round(X / SquareSize) * SquareSize
      Y = round(Y / SquareSize) * SquareSize
   end
end

local function draw_board()
   local black = love.graphics.newImage("assets/images/black.png")
   local white = love.graphics.newImage("assets/images/white.png")
   local board_size = 8
   for i = 1, board_size do
      for j = 1, board_size do
         local image = (i + j) % 2 == 0 and black or white
         love.graphics.draw(image, (i - 1) * SquareSize, (j - 1) * SquareSize, 0, SquareSize / image:getWidth(), SquareSize / image:getHeight())
      end
   end

end

local function draw_piece(piece, x, y)
   love.graphics.draw(piece, x, y, 0, SquareSize / piece:getWidth(), SquareSize / piece:getHeight())
end

function love.draw()
   love.graphics.setBackgroundColor(0, 0, 0)
   draw_board()

   local images = load_images()

   local piece = images.pieces["pawn"]

   draw_piece(piece, X, Y)
   draw_piece(images.pieces["knight"], 2 * SquareSize, 2 * SquareSize)
end

# Joseph Cooney
# CS 1400-LW2 XL
# Assignment 08
#import statements
import turtle
from random import randint


def reset():
    turtle.clear()
    turtle.goto(0, 0)
    turtle.setheading(0)
    
    
def setup():
    turtle.speed(0)
    turtle.screensize(1000, 800)
    turtle.penup()
    
    
def drawRectanglePattern(centerX, centerY, offset, width, height, count, rotation):
    for i in range(0, count):
        turtle.goto(centerX, centerY)
        setRandomColor()
        turtle.left((360 / count) * i)
        turtle.forward(offset)
        turtle.pendown()
        turtle.right(rotation)
        drawRectangle(width, height)
        turtle.penup()
        turtle.setheading(0)
        
        
def drawRectangle(width, height):
    turtle.right(90)
    for i in range(0, 2):
        turtle.forward(width)
        turtle.left(90)
        turtle.forward(height)
        turtle.left(90)
    
    
def drawCirclePattern(centerX, centerY, offset, radius, count):
    for i in range(0, count):
        turtle.goto(centerX, centerY)
        setRandomColor()
        turtle.left((360 / count) * i)
        turtle.forward(offset)
        turtle.right(90)
        turtle.pendown()
        turtle.circle(radius)
        turtle.penup()
        turtle.setheading(0)
        
        
def drawSuperPattern(num=3):
    for i in range(0, num):
        centerX = randint(-450, 450)
        centerY = randint(-350, 350)
        count = randint(1, 180)
        offset = randint(-100, 100)
        circOrRect = randint(1, 2)
        if circOrRect == 1:
            radius = randint(0, 100)
            drawCirclePattern(centerX, centerY, offset, radius, count)
        elif circOrRect == 2:
            width = randint(0, 100)
            height = randint(0, 100)
            rotation = randint(-180, 180)
            drawRectanglePattern(centerX, centerY, offset, width, height, count, rotation)
            
            
def setRandomColor():
    randColor = randint(1, 4)
    if randColor == 1:
        turtle.color("Blue")
    elif randColor == 2:
        turtle.color("Yellow")
    elif randColor == 3:
        turtle.color("Red")
    elif randColor == 4:
        turtle.color("Green")
        
        
def done():
    turtle.hideturtle()
    turtle.done()
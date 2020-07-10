from PIL import Image
import os
import PIL


image = Image.open('followericon.png')
image.resize((1080, 1080))
image.save('followericon1.png')

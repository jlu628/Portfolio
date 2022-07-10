from PIL import Image
import numpy as np

fn = 'background.png'
color = [0, 0, 0]
with Image.open(fn) as im:
    im = np.array(im)
    for i in range(im.shape[0]):
        for j in range(im.shape[1]):
            # if not im[i][j][3] == 0:
            grayscale = 0.299 * im[i][j][0] + 0.587 * im[i][j][0] + 0.114 * im[i][j][2]
            im[i][j][0] = 255 - grayscale
            im[i][j][1] = 255 - grayscale
            im[i][j][2] = 255 - grayscale
    im = Image.fromarray(im, 'RGBA')
    im.save('new'+fn)

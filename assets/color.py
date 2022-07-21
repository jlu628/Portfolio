from PIL import Image
import numpy as np

fn = '../images/projects/gtcssa.png'
color = [0, 0, 0]
with Image.open(fn) as im:
    im = np.array(im)
    for i in range(im.shape[0]):
        for j in range(im.shape[1]):
            if im[i][j][0] == 255 and im[i][j][1] == 255 and im[i][j][2] == 255 and im[i][j][3] == 255:
                im[i][j][0] = 240
                im[i][j][1] = 240
                im[i][j][2] = 240
                # im[i][j][3] = 1
    im = Image.fromarray(im, 'RGBA')
    im.save('../images/projects/newgtcssa.png')

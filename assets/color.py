from PIL import Image
import numpy as np

fn = 'search.png'
color = [0, 0, 0]
with Image.open(fn) as im:
    im = np.array(im)
    for i in range(im.shape[0]):
        for j in range(im.shape[1]):
            if not im[i][j][3] == 0:
                im[i][j][0] = color[0]
                im[i][j][1] = color[1]
                im[i][j][2] = color[2]
    im = Image.fromarray(im, 'RGBA')
    im.save('new'+fn)

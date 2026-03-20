---
layout: post
title: "Apple's Deep Learning Frameworks: BNNS vs. MPSCNN"
description: ""
category: articles
tags: [iOS]
comments: true
---

Original article: http://machinethink.net/blog/apple-deep-learning-bnns-versus-metal-cnn/

Original author: MATTHIJS HOLLEMANS

<!--Body starts here-->

# Apple's Deep Learning Frameworks: BNNS vs. MPSCNN

Starting with iOS 10, Apple introduced two deep learning frameworks on the iOS platform: BNNS and MPSCNN.

* BNNS: Short for (not bananas 😄) Basic Neural Network Subroutines, it is part of the [Accelerate framework](https://developer.apple.com/reference/accelerate). This framework makes full use of the CPU's fast vector instructions and provides a range of mathematical functions.

* MPSCNN is part of [Metal Performance Shaders](https://developer.apple.com/metal/). Metal Performance Shaders is a framework of optimized compute kernels that runs on the GPU (rather than the CPU).

So, as an iOS developer, you now have two APIs for deep learning, and they look very similar.

Which one should you choose?

In this article, we will compare BNNS and MPSCNN to show the differences between the two. We will also run speed tests on both APIs to see which one is faster.


## Why use BNNS or MPSCNN in the first place?

Let's start by discussing what these two frameworks do.

Currently, BNNS and MPSCNN are used to **perform inference** in the domain of **convolutional neural networks**.

Compared to something like [TensorFlow](https://tensorflow.org/) (which lets you build a neural network from scratch by constructing a computation graph), BNNS and MPSCNN provide a higher-level API, where you don't have to worry about the underlying math.

There is a downside: BNNS and MPSCNN have far fewer features than other frameworks like TensorFlow. They are easier to get started with, but they limit the kinds of deep learning you can do.

Apple's deep learning frameworks are designed for one purpose: to **pass data through network layers as quickly as possible**.

#### It's All About Layers

Think of a neural network as a pipeline that data flows through. The different stages in the pipeline are the network **layers**. These layers transform your data in different ways. In deep learning, we can have neural networks with as many as 10 or 100 layers.

![Cat2Probability](http://machinethink.net/images/bnns-vs-metal/Cat2Probability@2x.png)

Layers come in different kinds. BNNS and MPSCNN provide: convolutional layers, pooling layers, fully connected layers, and normalization layers.

In BNNS and MPSCNN, **layers are the primary building blocks**. You create layer objects, put data into a layer, and then read the results out of the layer. Incidentally, BNNS calls them "filters" rather than layers: data enters the filter in one form and leaves in another.

To illustrate the idea of layers as building blocks, here is how data flows through a simple neural network in BNNS:

```swift
// Allocate memory for intermediate and final results.
var tempBuffer1: [Float] = . . .
var tempBuffer2: [Float] = . . .
var results: [Float] = . . .

// Apply the first layer to the input data (e.g., an image).
BNNSFilterApply(convLayer, inputData, &tempBuffer1)

// Apply the second layer to the output of the first.
BNNSFilterApply(poolLayer, tempBuffer1, &tempBuffer2)

// Apply the third and final layer. The result is usually a probability distribution.
BNNSFilterApply(fcLayer, tempBuffer2, &results)
```

To build a neural network with BNNS or MPSCNN, you just set up the layers and send data through them. The framework handles what happens *inside* each layer, but you need to connect the layers.

Unfortunately, this can be a bit tedious. For example, you can't simply load a [pre-trained caffemodel file](http://caffe.berkeleyvision.org/model_zoo.html) to get a fully configured "neural network." You have to write the code by hand, carefully creating and configuring each layer to replicate the network design. This makes it easy to make mistakes.

#### BNNS and MPSCNN Don't Train

Before you can use a neural network, you must **train** it. Training requires a lot of data and patience — at least several hours, possibly days or weeks, depending on the computational power you can throw at it. You definitely don't want to train on your phone (it might catch fire).

Once the network is trained, it can be used for **prediction**. This is called "inference." While training requires some dedicated heavy-duty computers, inference is perfectly feasible on a modern smartphone.

This is exactly what BNNS and MPSCNN are designed for.

#### Convolutional Networks Only

But both APIs have limitations. Currently, BNNS and MPSCNN only support one kind of deep learning: convolutional neural networks (CNNs). The primary application area for CNNs is **computer vision** tasks. For example, you can use a CNN to [describe objects in a given photo](http://machinethink.net/blog/convolutional-neural-networks-on-the-iphone-with-vggnet/).

While CNNs are amazing, other deep learning architectures (such as recurrent neural networks) are not supported in BNNS or MPSCNN.

However, the building blocks already provided (convolutional layers, pooling layers, and fully connected layers) are efficient and provide a **good foundation** for building more complex neural networks, even if you have to hand-code some things to fill in the gaps in the API.

* Note: The Metal Performance Shaders framework also includes compute kernels for fast matrix multiplication on the GPU. The Accelerate framework contains the BLAS library for performing the same operations on the CPU. So even if BNNS or MPSCNN doesn't include all the layer types for your deep learning architecture, you can use these matrix routines to roll your own layer types. And if necessary, you can write your own GPU code in the Metal Shading Language.

## Differences

If their functionality is the same, why does Apple give us two APIs?

Simple: BNNS runs on the CPU, MPSCNN runs on the GPU. Sometimes using the CPU is faster, and sometimes using the GPU is faster.

* "Wait... isn't the GPU a massively parallel computation beast? Shouldn't we always be running our deep neural networks on the GPU?!"

Not necessarily. For training, you definitely want the massive parallelism of the GPU (even if it's just a cluster of many GPUs), but for inference, using a plain old 2- or 4-core CPU can actually be faster.

I'll discuss the speed differences in more detail below, but first let's look at how the two APIs differ.

* Note: The Metal Performance Shaders framework is only available for iOS and tvOS, not for Mac. BNNS also works on macOS 10.12 and later. If you want to ensure portability of your deep learning code between iOS and macOS, BNNS is your only option (or use a third-party framework).

#### Is It Swifty?

BNNS is actually a C-based API. It's fine if you use Objective-C, but it's a bit awkward in Swift. MPSCNN, on the other hand, is more Swift-friendly.

However, you have to accept the fact that these APIs are lower-level than something like UIKit. Swift doesn't abstract everything into simple types. You'll often need to work with raw bytes using Swift's `UnsafeRawPointer`.

Swift also doesn't have a native **16-bit float type**, but BNNS and MPSCNN are most efficient when using such half-precision floats. You'll have to use the Accelerate framework to convert between regular types and half-precision floats.

In theory, when using MPSCNN, you don't have to write any GPU code yourself, but in practice I find that some preprocessing steps — like subtracting the mean RGB value from each image pixel — are most easily implemented using a custom compute kernel in the Metal Shading Language (which is C++ based).

So, even if you use both frameworks from Swift, be prepared for some low-level hacking with both APIs.

#### Activation Functions

As data flows from one layer to the next in a neural network, it is transformed in some way at each layer. Layers apply activation functions as part of this transformation. Without these activation functions, neural networks would be unable to learn anything particularly interesting.

There are many choices of activation functions, and BNNS and MPSCNN both support the most commonly used ones:

- Rectified Linear Unit (ReLU) and Leaky ReLU
- Logistic sigmoid
- *tanh* and scaled *tanh*
- Absolute value
- The identity function, which passes data through unchanged
- Linear (MPSCNN only)

You might think this would be as simple as the APIs get, but strangely, BNNS defines these activation functions differently than MPSCNN.

For example, BNNS defines two types, `BNNSActivationFunctionRectifiedLinear` and `BNNSActivationFunctionLeakyRectifiedLinear`, but in MPSCNN, there is only one `MPSCNNNeuronReLU` type, using an `alpha` parameter to indicate whether it is a Leaky ReLU. The same goes for *tanh* and scaled *tanh*.

It's safe to say that MPSCNN takes a more flexible and customizable approach than BNNS. This is true across the entire API surface.

For example, MPSCNN allows you to create your own activation function by subclassing `MPSCNNNeuron` and writing some GPU code. This is not possible with BNNS, as there is no API for custom activation functions; only an enumeration is provided. If the activation function you want is not on the list, BNNS leaves you stuck.

* Updated Feb 10, 2017: The above is a bit misleading, so I should clarify. Since BNNS runs on the CPU, you can simply take the output of a layer and modify it as you like. If you need a special activation function, you can implement it yourself in Swift (preferably using the Accelerate framework) and apply it to the previous layer's output before passing it to the next layer. So BNNS is no less capable than Metal in this regard.

* Updated June 29, 2017: Clarification about `MPSCNNNeuron` subclasses: if you do this, you can't actually use it with `MPSCNNConvolution`. This is because MPS uses a trick when executing activation functions in GPU kernels that only works for Apple's own MPSCNNNeuron subclasses, not for any subclass you create yourself.

In fact, in MPSCNN, *everything* is a subclass of `MPSCNNKernel`. This means you can use an activation function like `MPSCNNNeuronLinear` on its own, as if it were a standalone layer. This is useful for scaling data by a constant in a preprocessing step. (By the way, BNNS has nothing analogous to a "linear" activation function.)

* Note: It feels to me like BNNS and MPSCNN were created by different teams within Apple. They have very similar functionality, but there are some strange differences between their APIs. I don't work at Apple, so I don't know the reason for these differences. Perhaps there are technical or performance reasons. But you should know that BNNS and MPSCNN are not "hot-swappable." If you want to find out which is faster for inference on CPU or GPU, you'll have to implement your deep learning network twice.

#### Layer Types

As I mentioned, deep neural networks are composed of different types of layers:

- Convolutional
- Pooling (max and average)
- Fully connected

Both BNNS and MPSCNN implement these three layer types, but with subtle differences in implementation.

For example, BNNS can apply an activation function to a pooling layer, but MPSCNN cannot. However, in MPSCNN, you can add an activation function as a separate layer after the pooling layer, so both APIs ultimately achieve the same functionality, just via different paths.

In MPSCNN, the fully connected layer is treated as a special case of convolution, while in BNNS it is implemented as matrix-vector multiplication. In practice this makes no difference, but it shows that the two frameworks take different approaches to the same problem.

I think **MPSCNN is more convenient to use** for developers.

When applying convolutions to images, the output image is slightly smaller unless you add "padding" pixels. With MPSCNN, you don't have to worry about this: you simply tell it how large you want the input and output images to be. With BNNS, you have to calculate the padding yourself. Details like this make MPSCNN the more user-friendly API.

In addition to the basic layers, MPSCNN also provides:

- Normalization layers
- Softmax
- Log Softmax
- Activation functions as layers

These additional layer types are not available in BNNS.

For normalization layers, this is probably not a big deal since I find them less common, but softmax is something most convolutional networks need at some point (typically at the end).

The softmax function transforms the output of a neural network into a probability distribution: "I'm 95% sure this photo is a cat, but only 5% sure it's a Pokémon."

The absence of softmax in BNNS is a bit strange. It's not hard to write your own using vDSP functions from the Accelerate framework, but it's not very convenient either.

#### Learned Parameters

When training a neural network, the training process adjusts a set of numbers that represent what the network is learning. These numbers are called **learned parameters**.

Learned parameters consist of so-called weights and bias values, which are just floating-point numbers. When you send data to a neural network, layers essentially multiply your data by these weights, add bias values, and then apply an activation function.

When creating layers, you need to specify weights and bias values for each layer. Both APIs require only a raw pointer to a buffer of floating-point values. It is up to you to ensure these numbers are organized in the correct way. If this is done incorrectly, the neural network will output garbage.

As you might have guessed: BNNS and MPSCNN use different memory layouts for weights. 😅

For MPSCNN, the weights array looks like this:

`weights[ outputChannel ][ kernelY ][ kernelX ][ inputChannel ]`

But for BNNS, the order is different:

`weights[ outputChannel ][ inputChannel ][ kernelY ][ kernelX ]`

I think the reason MPSCNN puts input channels last is that this maps nicely to the RGBA pixels in `MTLTexture`s where data is stored. But for CPU vector instructions used by BNNS, treating input channels as separate memory blocks is more efficient.

This difference is not a huge problem for developers, but you need to **know the weight memory layout** when importing trained models.

Note: You may need to write a conversion script to export data from training tools like TensorFlow or Caffe and convert it to the format expected by BNNS or MPSCNN. Neither API can read the model files saved by these tools; they only accept raw buffers of floating-point values.

MPSCNN always copies weight and bias values and stores them internally as 16-bit floats. Since you must supply them as single-precision floats, this effectively halves the precision of your learned parameters.

BNNS is more flexible here: it lets you choose the format in which you want to store learned parameters, and can also be configured not to copy them.

Loading weights into the network is only important during app startup when creating the network. However, if you have a large number of weights, you still need to take this seriously. My [VGGNet implementation](http://machinethink.net/blog/convolutional-neural-networks-on-the-iphone-with-vggnet/) wouldn't work on an iPhone 6 because the app ran out of memory trying to load all weights into MPSCNN at once. (The trick is to create large layers first, then smaller ones.)

#### Input Data

Once you've created all the layer objects, you can finally start using the neural network for inference!

As you can see, neither BNNS nor MPSCNN has a true concept of a "neural network" — they only see individual layers. You need to pass data through these layers one by one.

As a user of the neural network, the data you care about is the input going into the first layer (e.g., an image) and the output coming out of the last layer (the probability that the image is a cat). Everything else — data passed between layers — is just temporary intermediate results and not very interesting.

So what format does the input data need to be in?

MPSCNN requires all data to be placed inside a special `MPSImage` object, which is actually a collection of 2D textures. If you're working with images, this makes great sense — but if your data is not an image, you need to convert it to a Metal texture. This consumes CPU time. (You can use the Accelerate framework to help with this.)

Note: iOS devices use a unified memory model, which means the CPU and GPU access the same RAM chip. Unlike desktop computers or servers, you don't need to copy data to the GPU. So at least your iOS app won't have that performance overhead.

On the other hand, BNNS just needs a pointer to a buffer of floating-point values. There's no need to load data into a specific object. So this seems faster than using textures... doesn't it?

There is one important restriction: in BNNS, inputs from different "channels" cannot be interleaved.

If your input is an image, it has three channels: one for red pixels, one for green pixels, and one for blue pixels. The problem is that image files like PNG or JPEG are loaded into memory as interleaved RGBA values. BNNS does not accept this.

There is currently no way to tell BNNS to use red pixel values as channel 0, green as channel 1, blue as channel 2, and skip the alpha channel. Instead, you will have to rearrange the pixel data so that the input buffer first contains all R values, then all G values, then all B values.

This preprocessing step consumes precious computation time, which is unfortunate. On the other hand, perhaps these restrictions allow BNNS to make certain optimizations in how its layers perform computation, making the whole thing a net gain. But nobody knows for sure.

In any case, if you're processing images with BNNS (the primary use case for CNNs), you will likely need to do some rearranging of input data to get it in the right format.

There is also the issue of **data types**.

Both BNNS and MPSCNN allow you to specify input data as floating-point values (16-bit and 32-bit) or integers (8, 16, or 32 bits). You'll want to use floating-point data as input to the network, and you may not have a choice about the format of input data.

Typically, when you load a PNG or JPEG image, or pull a still image from the phone camera, you get a texture that uses unsigned 8-bit integers for the RGBA values of pixels. With MPSCNN this is fine: the texture is automatically converted to floating-point values.

With BNNS, you can specify `Int8` as the image data type, but I've had no luck with that. To be fair, I didn't spend much time on it — since I already had to rearrange the input image channels, it was simple to also convert the pixel data to floating-point values at the same time.

Note: Even if BNNS allows you to specify integers as the data type for data and weights, it will internally convert them to floating-point, perform the computation, and then convert the results back to integers. For best speed, you may want to skip this conversion step and always work directly with floating-point data, even if it uses 2 to 4 times more memory.

#### Temporary Data

In both BNNS and MPSCNN, each layer requires processing. You put data into a layer and get data out of a layer.

A deep network will have many layers. We only care about the output of the last layer, not the output of all the others. But we still need to store those intermediate results somewhere, even if they're only used briefly.

MPSCNN has a special object for this, `MPSTemporaryImage`. It's like an `MPSImage`, but can only be used once. Write data into it once, read it once. Afterward, its memory is reclaimed. (If you're familiar with Metal, they are implemented using Metal's resource heaps.)

You should use `MPSTemporaryImage` whenever possible, as this avoids a lot of memory allocation and deallocation.

With BNNS, you're on your own. You need to manage temporary data buffers yourself. Fortunately, it's quite simple: you can allocate one or two large arrays and reuse them between layers.

#### Multithreading

You may want to build network layers on a background thread. Loading all the data for learned parameters can take several seconds.

Performing inference on a background thread is also a good idea.

With a sufficiently deep neural network, inference can take anywhere from 0.1 to 0.5 seconds, a delay that is noticeable to users.

With MPSCNN, you create a command queue and a command buffer, then tell all layers to encode themselves to the command buffer, and finally submit the work to the GPU. The GPU will notify you via a callback when it's done.

All encoding work can be done on a background thread, and you don't need to do anything for synchronization.

Note: In a real-time scenario (e.g., feeding live video frames from the camera to the neural network), you want to keep the GPU busy and avoid CPU and GPU waiting on each other. The CPU should have already encoded the next video frame while the GPU is still processing the previous one. You'll need to use an array of `MPSImage` objects and synchronize access to them using semaphores — but honestly, I'd be very surprised if today's mobile devices can do deep learning in real time.

BNNS works on the CPU, so you can start work on a background thread and then block until BNNS is done.

It's best to let BNNS figure out how to split the work across available CPU cores, but there is a configuration option telling BNNS how many threads are available for computation. (MPSCNN doesn't need this; it will use as many GPU threads as possible.)

Note: You should not share MPSCNN or BNNS objects across multiple threads. They can be used on a single background thread, but not simultaneously on multiple threads.

## Speed

Deciding whether to use BNNS or MPSCNN comes down to a trade-off: **is it faster with CPU data or with GPU?**

Not all data is suitable for GPU processing. Images or video are very suitable, but something like time-series data may not be.

Loading data into the GPU has a cost, as you need to wrap it in `MTLTexture` objects. Once the GPU is done, reading the results requires extracting them from texture objects again.

With CPU-based BNNS, you don't have this overhead, but you also can't take advantage of the GPU's massive parallelism for computation.

In practice, developers will likely **try both approaches and see which is faster**. However, as shown above, since BNNS and MPSCNN have different APIs, you need to write the code twice.

Because I was curious, I decided to build a very basic convolutional neural network using both BNNS and MPSCNN to measure which is faster.

My neural network design looks roughly like this (click to enlarge):

![The convolutional neural network used for the speed test](http://machinethink.net/images/bnns-vs-metal/ConvNet@2x.png)

This network design can be used to classify images. The network takes a 256×256 RGB image (no alpha channel) as input and produces an array of 100 `Float` values. The output represents a probability distribution over 100 possible object categories.

In practice, a neural network would need more layers to be truly useful. It should also have a softmax layer at the end, but since BNNS doesn't have softmax, I left it out.

I didn't actually train this neural network to learn anything useful; instead, I initialized it with reasonable random values. It's a useless neural network. However, it does allow us to compare what's needed to build the same neural network in BNNS and MPSCNN, and how fast each runs.

If you want to follow along, [here is the code on GitHub](https://github.com/hollance/BNNS-vs-MPSCNN). Open the project in Xcode and run it on an iOS 10-compatible device with at least an A8 processor (it cannot run in the simulator).

![The speed test app](http://machinethink.net/images/bnns-vs-metal/Screenshot@2x.png)

After tapping the button, the app freezes for a few seconds while performing 100 independent inferences on each neural network. The app shows how long it takes to create the network (not very interesting) and how long it takes to complete 100 repeated inferences.

The app also prints out the results computed by each network. Since the networks haven't been trained, these numbers mean nothing — they're just for debugging purposes. I wanted to make sure both networks actually compute the same thing, ensuring the test is fair.

The small differences in the results are due to floating-point rounding (since Metal internally uses 16-bit floats, we only get 3 decimal places of precision), and also possibly due to differences in how each framework specifically performs its computations. But the results are close enough.

#### How the App Works

The app creates a neural network with 2 convolutional layers, 1 max pooling layer, 1 average pooling layer, and 1 fully connected layer. It then measures how long it takes to send the same image through the network 100 times.

The main source files involved are **BNNSTest.swift** and **MetalTest.swift**.

As you'd expect, the `BNNSTest` class creates the neural network using BNNS functionality. Here is a small snippet of code needed to create the first convolutional layer:

```swift
inputImgDesc = BNNSImageStackDescriptor(width: 256, height: 256, channels: 3,
                   row_stride: 256, image_stride: 256*256,
                   data_type: dataType, data_scale: 0, data_bias: 0)

conv1imgDesc = BNNSImageStackDescriptor(width: 256, height: 256, channels: 16,
                   row_stride: 256, image_stride: 256*256,
                   data_type: dataType, data_scale: 0, data_bias: 0)

let relu = BNNSActivation(function: BNNSActivationFunctionRectifiedLinear,
                          alpha: 0, beta: 0)

let conv1weightsData = BNNSLayerData(data: conv1weights, data_type: dataType,
                           data_scale: 0, data_bias: 0, data_table: nil)

let conv1biasData = BNNSLayerData(data: conv1bias, data_type: dataType,
                        data_scale: 0, data_bias: 0, data_table: nil)

var conv1desc = BNNSConvolutionLayerParameters(x_stride: 1, y_stride: 1,
                    x_padding: 2, y_padding: 2, k_width: 5, k_height: 5,
                    in_channels: 3, out_channels: 16,
                    weights: conv1weightsData, bias: conv1biasData,
                    activation: relu)

conv1 = BNNSFilterCreateConvolutionLayer(&inputImgDesc, &conv1imgDesc,
                                         &conv1desc, &filterParams)
```

With BNNS, you need to create a lot of "descriptor" helper objects describing the data you'll use and the properties and weights of the layer. This repeats for other layers. Now you can see why I said earlier this would be tedious.

The `MetalTest` class does the same thing with `MPSCNN`:

```swift
conv1imgDesc = MPSImageDescriptor(channelFormat: channelFormat, width: 256,
                                  height: 256, featureChannels: 16)

let relu = MPSCNNNeuronReLU(device: device, a: 0)

let conv1desc = MPSCNNConvolutionDescriptor(kernelWidth: 5, kernelHeight: 5,
                    inputFeatureChannels: 3, outputFeatureChannels: 16,
                    neuronFilter: relu)

conv1 = MPSCNNConvolution(device: device, convolutionDescriptor: conv1desc,
            kernelWeights: conv1weights, biasTerms: conv1bias, flags: .none)
```

Here you also create various descriptor objects, but the code is shorter.

You've already seen how to do inference with BNNS: you call `BNNSFilterApply()` once per layer:

```swift
if BNNSFilterApply(conv1, imagePointer, &temp1) != 0 {
  print("BNNSFilterApply failed on layer conv1")
}

if BNNSFilterApply(pool1, temp1, &temp2) != 0 {
  print("BNNSFilterApply failed on layer pool1")
}

if BNNSFilterApply(conv2, temp2, &temp1) != 0 {
  print("BNNSFilterApply failed on layer conv2")
}

if BNNSFilterApply(pool2, temp1, &temp2) != 0 {
  print("BNNSFilterApply failed on layer pool2")
}

if BNNSFilterApply(fc3, temp2, &results) != 0 {
  print("BNNSFilterApply failed on layer fc3")
}
```

Here, `imagePointer` points to a Swift array of `Float` values. Similarly, `temp1` and `temp2` are ordinary Swift `Float` arrays. We keep reusing these arrays to store intermediate results. The network's final output is written into `results` of type `[Float]`. Once the network finishes computation, we can immediately read this array's results and use them elsewhere in our app.

Using MPSCNN is very similar:

```swift
let commandBuffer = commandQueue.makeCommandBuffer()

let conv1img = MPSTemporaryImage(commandBuffer: commandBuffer,
                                 imageDescriptor: conv1imgDesc)
conv1.encode(commandBuffer: commandBuffer, sourceImage: inputImage,
             destinationImage: conv1img)

let pool1img = MPSTemporaryImage(commandBuffer: commandBuffer,
                                 imageDescriptor: pool1imgDesc)
pool1.encode(commandBuffer: commandBuffer, sourceImage: conv1img,
             destinationImage: pool1img)
. . .

fc3.encode(commandBuffer: commandBuffer, sourceImage: pool2img,
           destinationImage: outputImage)

commandBuffer.commit()
```

You create an `MPSTemporaryImage` object to hold the results of the current layer, then tell the layer to `encode()` itself and add it to Metal's command buffer. These `MPSTemporaryImage` objects are equivalent to the `temp1` and `temp2` used in our BNNS code. MPSCNN manages its own storage in the background.

`inputImage` and `outputImage` are the network's input and output respectively, so they are stored in persistent `MPSImage` objects.

Note that the GPU will not do anything until you call `commit()` on the command buffer. With BNNS, each call to `BNNSFilterApply()` immediately starts processing. But `layer.encode(...)` in MPSCNN just creates GPU commands without immediately executing them. After calling `commit()`, the GPU starts processing data, and the CPU is free to handle more work.

What we really want is the neural network's output as an array of `Float` values. BNNS already works with plain Swift arrays, so we don't need to do anything special here. But for MPSCNN, we need to convert the output `MPSImage` object's texture into something we can use in Swift. The app's **`MPSImage + Floats.swift`** file contains some helper code for this.

Note: If you're using 16-bit floats with BNNS (which you likely will), at some point you need to convert back to 32-bit floats. In the demo app, this is done before the last layer rather than after, because the fully connected layer cannot handle 16-bit floats.

#### Test Metrics

I wanted to make a fair comparison of the running times of the exact same neural network built in BNNS and MPSCNN.

I did not measure the time needed to convert input data to the correct format. If the input data is an image and you're using MPSCNN, you can load it into a texture and forget about it. But not with BNNS: you first need to completely rearrange the image data in memory, which can be very time-consuming.

However, this actually depends on what neural network you're using, which is why I didn't want to measure it. But in our speed test, it does give BNNS a slight advantage, since getting input data in the correct form for BNNS is slower.

For output data, I measured the time needed to convert it back to a Swift array. Here, MPSCNN is slower, while BNNS has essentially no cost (if using 32-bit floats). So this also favors BNNS.

However, I think it's fair to include conversion in the measurement in this case, because converting network output is something you'll almost always have to do. This is a downside of using the GPU for general-purpose computation and therefore reduces the performance gains from using the GPU.

For a fair test, I wanted to use 16-bit floats in both MPSCNN and BNNS. MPSCNN always stores weights internally as `float16`, so to be fair, we should also have BNNS use 16-bit floats. The downside is that Swift doesn't have a "half float" type, so even when using BNNS, you always need to convert back and forth to "real" 32-bit floats.

Note: In **ViewController.swift** there are several options that let you change what is being tested. In particular, it lets you change the data type of learned parameters and the data type used by layers to perform computations. There is also an option to make the network larger, which increases the amount of computation required, since the initial network is small and may not be representative of real deep learning architectures.

#### Test Results

Are you ready?

For a basic 5-layer convolutional network, on my iPhone 6s, using 16-bit floats, BNNS is about 25% faster than MPSCNN.

So it's a win for the CPU.

However, if we make the network larger by providing more processing channels in each layer (changing the `multiplier` value in the app), MPSCNN will easily outperform BNNS.

MPSCNN is also faster than BNNS when using 32-bit floats. (Probably because MPSCNN internally always uses 16-bit floats, but BNNS now has twice the work.)

As a general guideline, if the inference you send to the network requires **more than 300 million floating-point operations**, it is better to switch to MPSCNN.

I arrived at this number as follows:

```
Number of flops per layer = 2 × kernelWidth   × kernelHeight   ×
                                inputChannels × outputChannels ×
                                outputWidth   × outputHeight
```

I then added up the flops for each layer and experimented with network sizes to verify the tipping point at which MPSCNN becomes faster than BNNS.

Warning: This is a super unscientific experiment and my calculations could be off. But if you do a back-of-the-envelope calculation for your deep network and find it needs 1 Gflops (one billion floating-point operations per second) or more, it's clear that BNNS won't cut it.

But note that this depends on many factors:

- Device type. I only tested on an iPhone 6s. Performance may differ on a slower iPhone 6 or a faster iPhone 7.

- Your data. As I noted, MPSCNN can easily load images into textures, but for BNNS you first need to completely rearrange pixel data. The preprocessing you need to do affects performance.

- Similarly, any conversion of network output data for use in Swift may slow things down.

- Memory bandwidth. In my [VGGNet implementation](http://machinethink.net/blog/convolutional-neural-networks-on-the-iphone-with-vggnet/), the learned parameters take up about 260 MB of RAM. For each inference, the neural network not only has to do a lot of computation, but also needs to access millions of storage cells. Bandwidth can easily become a bottleneck.

I tried to make the test as fair as possible, but bugs and other quirks in both frameworks made the process less than perfect.

For example, the BNNS fully connected layer cannot accept 16-bit floats, so I had to convert the data back to 32-bit floats first. Since the fully connected layer performs a lot of computation, BNNS might be faster if it supported these half-precision floats. MPSCNN's layers also have their own quirks (see the [source code](https://github.com/hollance/BNNS-vs-MPSCNN) for details).

Note: I didn't test batching. Both APIs can process multiple input images at once. This simply increases the amount of data sent to the network at one time. However, the GPU may have an advantage here, as batching may make better use of GPU bandwidth.

## Conclusion

So which API should you use? It depends™.

Both APIs are limited in functionality and still have some shortcomings. For smaller networks, BNNS is faster, but slower for larger networks. BNNS also has less functionality and you have to write more code yourself. Overall, the BNNS API is a bit uglier than MPSCNN, probably because it's a C API imported into Swift.

However, BNNS has one advantage over MPSCNN: it also runs on macOS.

Tip: **Use 16-bit floats**. Even though 16-bit floats are not a native Swift type, they make BNNS execute more efficiently, even if it means you have to convert regular arrays to 16-bit floats and back.

Personally, I'd probably stick with MPSCNN. It is more flexible, and you can combine it with Metal Performance Shaders' fast matrix multiplication routines and your own compute kernels.

**The most important thing is how fast your app runs and how well the inference works.**

If your project is urgent and needs to be fast, use MPSCNN. But if you can spare the time, it's best to implement your neural network with both APIs and see which one you can tune to optimal efficiency.

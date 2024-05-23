from setuptools import setup, Distribution
import pathlib

class BinaryDistribution(Distribution):
    def has_ext_modules(self):
        return True

setup(
    name="usfm-grammar",  # Required
    version="3.0.0-beta.7",  # Required
    python_requires=">=3.10",
    install_requires=["tree-sitter==0.21.3", "lxml==5.2.2"],  # Optional
    package_data={  # Optional
        "usfm_grammar": ["my-languages.so"],
    },
    distclass = BinaryDistribution,
)
